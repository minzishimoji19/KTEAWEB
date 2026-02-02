import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { LoyaltyService } from '../services/loyalty';

const router = Router();
const prisma = new PrismaClient();

// GET /transactions - List
router.get('/', requireAuth, async (req: Request, res: Response) => {
    const { status, customerId } = req.query;
    const whereClause: any = {};

    if (status) whereClause.status = status;
    if (customerId) whereClause.customerId = customerId;

    try {
        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: {
                customer: { select: { name: true, phone: true } },
                createdBy: { select: { email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// POST /transactions - Create
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    const {
        customerId,
        amountGross,
        amountNet,
        ticketCount,
        purchaseDate,
        productType,
        channel,
        movieName,
        voucherCode,
        proofImageUrl,
        cinemaName,
        discountPercent
    } = req.body;

    if (!customerId || !amountGross) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        const transaction = await prisma.transaction.create({
            data: {
                customerId,
                amountGross: Number(amountGross),
                amountNet: Number(amountNet || amountGross),
                ticketCount: Number(ticketCount || 1), // Default to 1 if missing
                purchaseDate: new Date(purchaseDate),
                productType,
                channel: channel || 'OFFLINE',  // Default to OFFLINE if missing
                movieName,
                cinemaName,
                discountPercent: Number(discountPercent || 0),
                voucherCode,
                proofImageUrl,
                status: 'PENDING',
                createdById: req.user?.userId,
            },
        });

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                userId: req.user!.userId,
                action: 'CREATE_TRANSACTION',
                entityType: 'TRANSACTION',
                entityId: transaction.id,
                metaJson: { amount: amountGross, customer: customerId }
            }
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// PATCH /transactions/:id/confirm
router.patch('/:id/confirm', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    // Role check: Only Operator or Admin
    if (req.user?.role === 'VIEWER') {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    try {
        // Guard: Check status first
        const existingTx = await prisma.transaction.findUnique({ where: { id } });
        if (!existingTx) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }

        // Idempotency: If already confirmed, return 200 with idempotency message
        if (existingTx.status === 'CONFIRMED') {
            res.json({ ...existingTx, _message: 'Transaction already confirmed' });
            return;
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: { status: 'CONFIRMED' },
        });

        // Trigger Loyalty Calculation
        try {
            await LoyaltyService.earnPoints(transaction.id);
            await LoyaltyService.checkTier(transaction.customerId);
        } catch (err) {
            console.error("Loyalty calculation failed", err);
            // Don't fail the request, just log it.
        }

        await prisma.auditLog.create({
            data: {
                userId: req.user!.userId,
                action: 'CONFIRM_TRANSACTION',
                entityType: 'TRANSACTION',
                entityId: transaction.id,
            }
        });

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to confirm transaction' });
    }
});

// PATCH /transactions/:id/reject
router.patch('/:id/reject', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    if (req.user?.role === 'VIEWER') {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    try {
        // Guard: Check status first
        const existingTx = await prisma.transaction.findUnique({ where: { id } });
        if (!existingTx) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }

        // Guard: Cannot reject confirmed
        if (existingTx.status === 'CONFIRMED') {
            res.status(400).json({ error: 'Cannot reject a confirmed transaction' });
            return;
        }

        // Idempotency: If already rejected, return 200
        if (existingTx.status === 'REJECTED') {
            res.json({ ...existingTx, _message: 'Transaction already rejected' });
            return;
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: { status: 'REJECTED' },
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user!.userId,
                action: 'REJECT_TRANSACTION',
                entityType: 'TRANSACTION',
                entityId: transaction.id,
            }
        });

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject transaction' });
    }
});

export default router;
