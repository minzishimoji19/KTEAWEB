
import { PrismaClient } from '@prisma/client';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NotificationService } from './notification';

const prisma = new PrismaClient();

// --- CONFIG ---
// In real app, these come from .env
const API_ID = Number(process.env.TELEGRAM_API_ID) || 0;
const API_HASH = process.env.TELEGRAM_API_HASH || '';
const SESSION = new StringSession(process.env.TELEGRAM_SESSION || ''); // Save this after auth

// --- PARSER ---
function parseVoucher(text: string): { code?: string, discountValue?: number, platform?: string } {
    const codeMatch = text.match(/(?:code|mã)[:\s]+([A-Z0-9]{4,})/i);
    const discountMatch = text.match(/(\d+)(?:k|%)/i);
    const platformMatch = text.match(/(cgv|lotte|galaxy|bhd)/i);

    return {
        code: codeMatch ? codeMatch[1] : undefined,
        discountValue: discountMatch ? Number(discountMatch[1]) : 0,
        platform: platformMatch ? platformMatch[0].toUpperCase() : 'UNKNOWN'
    };
}

// --- TELEGRAM ---
export class TelegramIngest {
    static async fetchMessages(channelId: string, limit = 10) {
        if (!API_ID || !API_HASH) {
            console.log('[Telegram] Missing Config. Skipping.');
            return [];
        }

        const client = new TelegramClient(SESSION, API_ID, API_HASH, { connectionRetries: 1 });
        await client.connect();

        // This requires real auth flow first! 
        // For MVP/Demo: Assume client is authorized or fail gracefully.
        if (!await client.checkAuthorization()) {
            console.log('[Telegram] Client not authorized. Run manual auth script first.');
            return [];
        }

        const result = await client.invoke(
            new Api.messages.GetHistory({
                peer: channelId,
                limit: limit
            })
        ) as Api.messages.ChannelMessages;

        return result.messages || [];
    }
}

// --- WEB CRAWLER ---
export class WebIngest {
    static async crawl(url: string, selector: string) {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const items: string[] = [];
            $(selector).each((_, el) => {
                items.push($(el).text().trim());
            });
            return items;
        } catch (e) {
            console.error('[WebIngest] Error:', e);
            return [];
        }
    }
}

// --- MAIN JOB ---
export async function ingestVouchers() {
    console.log('[Ingest] Starting...');

    // 1. Get Sources
    const sources = await prisma.voucherSource.findMany({ where: { isEnabled: true } });

    for (const source of sources) {
        try {
            const config = source.parserConfig as any;
            let rawData: string[] = [];

            // 2. Fetch Data
            if (source.type === 'TELEGRAM') {
                const msgs = await TelegramIngest.fetchMessages(config.channelId);
                rawData = msgs.map((m: any) => m.message).filter((m: any) => !!m);
            } else if (source.type === 'WEBSITE') {
                rawData = await WebIngest.crawl(config.url, config.selector);
            }

            // 3. Parse & Save
            let count = 0;
            for (const text of rawData) {
                if (!text) continue;
                const { code, discountValue, platform } = parseVoucher(text);

                // If we found a code, check existence
                if (code) {
                    // Code is not unique anymore, so we check using findFirst or similar logic
                    // Here we check if ANY voucher with this code exists to avoid spam.
                    const existing = await prisma.voucher.findFirst({ where: { code } });
                    if (!existing) {
                        await prisma.voucher.create({
                            data: {
                                title: `[Auto] ${platform || 'Deal'} - ${code}`,
                                code,
                                description: text, // Store raw text in description
                                discountType: 'AMOUNT', // Default guessing
                                discountValue: discountValue || 0,
                                cinemaChain: platform || 'OTHER', // Map platform to cinemaChain
                                status: 'SUSPICIOUS', // Mark as suspicious/pending validation
                                verifyStatus: 'UNVERIFIED',
                                sourceType: 'WHITELIST_SYNC',
                                sourceId: source.id,
                                createdBy: 'SYSTEM' // System user
                            }
                        });

                        // Send Notification
                        await NotificationService.sendVoucherAlert({
                            code,
                            discountValue: discountValue || 0,
                            platform: platform || 'UNKNOWN',
                            rawText: text || ''
                        });

                        count++;
                    }
                }
            }

            // 4. Log
            await prisma.voucherJobLog.create({
                data: {
                    sourceId: source.id,
                    status: 'SUCCESS',
                    foundCount: count
                }
            });

        } catch (error: any) {
            await prisma.voucherJobLog.create({
                data: {
                    sourceId: source.id,
                    status: 'FAIL',
                    errorMessage: error.message
                }
            });
        }
    }
    console.log('[Ingest] Finished.');
}
