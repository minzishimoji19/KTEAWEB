import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /customers - List & Search
router.get('/', requireAuth, async (req: Request, res: Response) => {
    const { search } = req.query;
    const whereClause: any = {};

    if (search) {
        whereClause.OR = [
            { phone: { contains: String(search), mode: 'insensitive' } },
            { name: { contains: String(search), mode: 'insensitive' } },
        ];
    }

    try {
        const customers = await prisma.customer.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: 50, // simple pagination limit
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// GET /customers/:id - Detail
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

// POST /customers - Create
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
    const { phone, name, relationship, bankAccount, gameRank, note } = req.body;

    if (!phone || !name) {
        res.status(400).json({ error: 'Phone and Name are required' });
        return;
    }

    try {
        const existing = await prisma.customer.findUnique({ where: { phone } });
        if (existing) {
            res.status(400).json({ error: 'Phone number already exists' });
            return;
        }

        const customer = await prisma.customer.create({
            data: {
                phone,
                name,
                relationship,
                bankAccount,
                gameRank,
                note,
            },
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

// PUT /customers/:id - Update
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, relationship, bankAccount, gameRank, note } = req.body;

    try {
        const customer = await prisma.customer.update({
            where: { id },
            data: { name, relationship, bankAccount, gameRank, note },
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// PATCH /customers/:id/status
router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' | 'INACTIVE'

    try {
        const customer = await prisma.customer.update({
            where: { id },
            data: { status },
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

export default router;
