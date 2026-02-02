
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const rules = await prisma.pointRule.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1
    });
    console.log('Current Rules:', JSON.stringify(rules, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
