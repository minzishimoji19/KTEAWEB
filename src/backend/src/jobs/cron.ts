
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { ingestVouchers } from '../services/automation';

const prisma = new PrismaClient();

// Placeholder for ingest logic
async function runVoucherIngest() {
    console.log('[Cron] Starting Voucher Ingest...');
    await ingestVouchers();
}

export function setupCronJobs() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        runVoucherIngest().catch(err => console.error('[Cron] Error:', err));
    });
    console.log('[Cron] Jobs scheduled: Voucher Ingest (every 5m)');

    // Voucher Hunter Sync (Internal) - Every 6 hours
    cron.schedule('0 */6 * * *', () => {
        const { VoucherHuntService } = require('../services/voucher-hunt');
        VoucherHuntService.syncSources().catch((err: any) => console.error('[Cron] Voucher Hunt Error:', err));
    });
    console.log('[Cron] Jobs scheduled: Voucher Hunter Sync (every 6h)');
}
