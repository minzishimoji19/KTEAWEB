
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find the latest rule
    const rule = await prisma.pointRule.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (rule) {
        console.log('Updating rule:', rule.id);
        const updated = await prisma.pointRule.update({
            where: { id: rule.id },
            data: {
                ticketMultiplier: 1.0,
                comboMultiplier: 1.5
            }
        });
        console.log('Updated Rule:', updated);
    } else {
        console.log('No rule found to update.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
