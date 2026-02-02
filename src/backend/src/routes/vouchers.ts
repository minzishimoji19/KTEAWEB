import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /vouchers - List all with filters
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { search, status } = req.query;
        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { code: { contains: String(search), mode: 'insensitive' } },
                { cinemaChain: { contains: String(search), mode: 'insensitive' } },
                { title: { contains: String(search), mode: 'insensitive' } },
                { internalNotes: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        const vouchers = await prisma.voucher.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(vouchers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch vouchers' });
    }
});

// POST /vouchers - Create new
router.post('/', requireAuth, requireRole(['ADMIN', 'OPERATOR']), async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, discountType, discountValue, cinemaChain, expiryDate, internalNotes, title } = req.body;

        // Check for duplicate code (if code is provided)
        if (code) {
            const existing = await prisma.voucher.findFirst({ where: { code } });
            if (existing) {
                res.status(400).json({ error: 'Voucher code already exists' });
                return;
            }
        }

        const voucher = await prisma.voucher.create({
            data: {
                title: title || 'Untitled Voucher',
                code,
                discountType: discountType || 'PERCENT',
                discountValue: discountValue ? Number(discountValue) : null,
                cinemaChain: cinemaChain || 'OTHER',
                endAt: expiryDate ? new Date(expiryDate) : null,
                internalNotes,
                status: 'ACTIVE'
            }
        });

        res.status(201).json(voucher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create voucher' });
    }
});

// PUT /vouchers/:id - Update
router.put('/:id', requireAuth, requireRole(['ADMIN', 'OPERATOR']), async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { discountType, discountValue, cinemaChain, expiryDate, internalNotes, status, title } = req.body;

        const voucher = await prisma.voucher.update({
            where: { id },
            data: {
                title,
                discountType,
                discountValue: discountValue ? Number(discountValue) : undefined,
                cinemaChain,
                endAt: expiryDate ? new Date(expiryDate) : undefined,
                internalNotes,
                status
            }
        });

        res.json(voucher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update voucher' });
    }
});

// DELETE /vouchers/:id - Delete (Admin only)
router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.voucher.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete voucher' });
    }
});

export default router;
