import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = 'password123'; // Default for all for simplicity in dev, or specific as requested
    // Using specific passwords as per request
    const adminPwd = await bcrypt.hash('minh19112006', 10);
    const opPwd = await bcrypt.hash('operator123', 10);
    const viewPwd = await bcrypt.hash('viewer123', 10);

    const users = [
        { email: 'minh19112006@gmail.com', passwordHash: adminPwd, role: Role.ADMIN },
        { email: 'operator@example.com', passwordHash: opPwd, role: Role.OPERATOR },
        { email: 'viewer@example.com', passwordHash: viewPwd, role: Role.VIEWER },
    ];

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                passwordHash: u.passwordHash,
                role: u.role,
            },
        });
        console.log(`Upserted user: ${user.email}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
