
import axios from 'axios';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export class NotificationService {
    static async sendVoucherAlert(voucher: { code: string, discountValue: number, platform: string, rawText?: string }) {
        if (!BOT_TOKEN || !CHANNEL_ID) {
            console.warn('[Notification] Missing Bot Token or Channel ID');
            return;
        }

        const message = `
🎟 **VOUCHER TÌM THẤY!** 🎟
-------------------------
🏢 Phim: ${voucher.platform}
💰 Giảm: ${voucher.discountValue}
🔡 Code: \`${voucher.code}\`
-------------------------
📝 ${voucher.rawText?.substring(0, 50)}...
`;

        try {
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: CHANNEL_ID,
                text: message,
                parse_mode: 'Markdown'
            });
            console.log(`[Notification] Sent alert for ${voucher.code}`);
        } catch (error) {
            console.error('[Notification] Failed to send alert', error);
        }
    }
}
