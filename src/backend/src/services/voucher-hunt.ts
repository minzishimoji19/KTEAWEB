import { PrismaClient, Voucher } from '@prisma/client';

const prisma = new PrismaClient();

interface VoucherFilters {
    search?: string;
    cinemaChain?: string;
    status?: string;
    verifyStatus?: string;
    voucherType?: string;
}

export class VoucherHuntService {

    /**
     * Advanced Search for "Hunting"
     */
    static async search(filters: VoucherFilters, page: number = 1, limit: number = 20) {
        const { search, cinemaChain, status, verifyStatus, voucherType } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (cinemaChain) where.cinemaChain = cinemaChain;
        if (status) where.status = status;
        if (verifyStatus) where.verifyStatus = verifyStatus;
        if (voucherType) where.voucherType = voucherType;

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { internalNotes: { contains: search, mode: 'insensitive' } },
                { cinemaChain: { contains: search, mode: 'insensitive' } } // Allow searching by cinema text loosely
            ];
        }

        const [vouchers, total] = await Promise.all([
            prisma.voucher.findMany({
                where,
                orderBy: [
                    { verifiedAt: 'desc' }, // Verified ones first? Or sort param?
                    { endAt: 'asc' },       // Expiring soon
                    { createdAt: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma.voucher.count({ where })
        ]);

        return {
            data: vouchers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async create(data: any, userId: string): Promise<Voucher> {
        return prisma.voucher.create({
            data: {
                ...data,
                createdBy: userId,
                status: 'ACTIVE',
                verifyStatus: 'UNVERIFIED',
                sourceType: 'MANUAL'
            }
        });
    }

    static async update(id: string, data: any): Promise<Voucher> {
        return prisma.voucher.update({
            where: { id },
            data
        });
    }

    static async verify(id: string, userId: string): Promise<Voucher> {
        return prisma.voucher.update({
            where: { id },
            data: {
                verifyStatus: 'VERIFIED',
                verifiedAt: new Date(),
                lastTestedAt: new Date(),
                verifiedBy: userId,
                status: 'ACTIVE' // Ensure active if verified
            }
        });
    }

    /**
     * Stub for Crawler Sync
     */
    static async syncSources() {
        console.log("[VoucherHunt] Starting Sync Job...");

        // 1. Get enabled sources
        const sources = await prisma.voucherSource.findMany({
            where: { isEnabled: true }
        });

        console.log(`[VoucherHunt] Found ${sources.length} sources.`);

        // 2. Loop and "Crawl" (Stub)
        for (const source of sources) {
            try {
                // await Crawler.process(source);
                console.log(`[VoucherHunt] Syncing ${source.name}...`);

                // Mock adding a voucher found from source
                const mockTitle = `[STUB] ${source.name} Deal ${Date.now()}`;

                // Dedup check logic would go here
                // ...

                // Log result
                await prisma.voucherSource.update({
                    where: { id: source.id },
                    data: {
                        lastSyncedAt: new Date(),
                        lastSyncStatus: 'SUCCESS'
                    }
                });

            } catch (err: any) {
                console.error(`[VoucherHunt] Failed to sync ${source.name}`, err);
                await prisma.voucherSource.update({
                    where: { id: source.id },
                    data: {
                        lastSyncedAt: new Date(),
                        lastSyncStatus: 'ERROR',
                        lastSyncError: err.message
                    }
                });
            }
        }
        console.log("[VoucherHunt] Sync Job Completed.");
    }
}
