
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Voucher Sources...');

    // 1. Telegram
    await prisma.voucherSource.create({
        data: {
            name: 'Telegram - Deal Phim',
            type: 'TELEGRAM',
            configJson: { channelId: '123456789' }, // Replace with real ID
            isActive: true
        }
    });

    // 2. Website Mock
    await prisma.voucherSource.create({
        data: {
            name: 'Website - CGV Promo',
            type: 'WEBSITE',
            configJson: { url: 'https://example.com/promo', selector: '.voucher-item' },
            isActive: false
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
