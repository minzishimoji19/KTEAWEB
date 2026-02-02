import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { LoyaltyService } from '../services/loyalty';

const router = Router();
const prisma = new PrismaClient();

// GET /loyalty/rules - Get Current Rule
router.get('/rules', requireAuth, async (req: Request, res: Response) => {
    try {
        const rule = await LoyaltyService.getActiveRule();
        res.json(rule);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rules' });
    }
});

// PUT /loyalty/rules - Update (Create new) Rule
router.put('/rules', requireAuth, async (req: Request, res: Response): Promise<void> => {
    // Only Admin
    // @ts-ignore
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin only' });
        return;
    }

    const { conversionUnit, ticketMultiplier, comboMultiplier, appWebBonus, pointsExpiryMonths } = req.body;

    try {
        const rule = await prisma.pointRule.create({
            data: {
                conversionUnit: Number(conversionUnit),
                ticketMultiplier: Number(ticketMultiplier),
                comboMultiplier: Number(comboMultiplier),
                appWebBonus: Number(appWebBonus),
                pointsExpiryMonths: Number(pointsExpiryMonths)
            }
        });
        res.json(rule);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update rules' });
    }
});

// GET /loyalty/ledger/:customerId
router.get('/ledger/:customerId', requireAuth, async (req: Request, res: Response) => {
    const { customerId } = req.params;
    try {
        const ledger = await prisma.pointLedger.findMany({
            where: { customerId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(ledger);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ledger' });
    }
});

// POST /loyalty/redeem
router.post('/redeem', requireAuth, async (req: Request, res: Response): Promise<void> => {
    const { customerId, points, note } = req.body;

    if (!points || points <= 0) {
        res.status(400).json({ error: 'Points must be greater than 0' });
        return;
    }

    try {
        await LoyaltyService.redeemPoints(customerId, points);

        // Audit log (manual since service doesn't have request context)
        // @ts-ignore
        await prisma.auditLog.create({
            data: {
                // @ts-ignore
                userId: req.user!.userId,
                action: 'REDEEM_POINTS',
                entityType: 'CUSTOMER',
                entityId: customerId,
                metaJson: { points, note }
            }
        });

        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Redemption failed' });
    }
});

// GET /loyalty/top-customers
router.get('/top-customers', requireAuth, async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const customers = await LoyaltyService.getTopCustomers(limit);

        // Map snake_case to camelCase for frontend consistency
        const mapped = customers.map((c: any) => ({
            id: c.customer_id,
            name: c.name,
            phone: c.phone,
            tier: c.tier,
            pointsAvailable: c.points_available,
            netSpend: c.net_spend,
            transactionsCount: c.transactions_count,
            tickets: c.tickets
        }));

        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch top customers' });
    }
});

// GET /loyalty/reward-vouchers
router.get('/reward-vouchers', requireAuth, async (req: Request, res: Response) => {
    const customerId = req.query.customerId as string;
    if (!customerId) {
        res.status(400).json({ error: 'Customer ID required' });
        return;
    }

    try {
        const vouchers = await prisma.rewardVoucher.findMany({
            where: { customerId },
            orderBy: { issuedAt: 'desc' }
        });
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vouchers' });
    }
});

// POST /loyalty/redeem-voucher
router.post('/redeem-voucher', requireAuth, async (req: Request, res: Response): Promise<void> => {
    const { customerId, rewardId } = req.body;

    if (!customerId || !rewardId) {
        res.status(400).json({ error: 'Missing parameters' });
        return;
    }

    try {
        const result = await LoyaltyService.redeemVoucher(customerId, rewardId);

        // Audit log
        // @ts-ignore
        await prisma.auditLog.create({
            data: {
                // @ts-ignore
                userId: req.user!.userId,
                action: 'REDEEM_VOUCHER',
                entityType: 'CUSTOMER',
                entityId: customerId,
                metaJson: { rewardId, voucherCode: result.voucher.code }
            }
        });

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Redemption failed' });
    }
});

export default router;
