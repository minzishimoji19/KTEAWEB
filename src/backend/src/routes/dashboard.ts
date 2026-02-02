import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Helper to parse dates
const parseDateRange = (req: Request) => {
    const { from, to } = req.query;
    const startDate = from ? new Date(String(from)) : new Date(new Date().setDate(new Date().getDate() - 30)); // default 30 days
    const endDate = to ? new Date(String(to)) : new Date();
    // Adjust end date to end of day
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
};

// GET /dashboard/summary
router.get('/summary', requireAuth, async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = parseDateRange(req);

        // Revenue & Tickets
        const txAgg = await prisma.transaction.aggregate({
            where: {
                purchaseDate: { gte: startDate, lte: endDate },
                status: 'CONFIRMED'
            },
            _sum: {
                amountGross: true,
                amountNet: true,
            },
            _count: {
                id: true
            }
        });

        const newCustomers = await prisma.customer.count({
            where: {
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        // Circulating Points (All time, not just range)
        // Only active points that haven't been redeemed or expired
        const ledgerAgg = await prisma.pointLedger.aggregate({
            _sum: {
                points: true
            }
        });

        res.json({
            gross_revenue: txAgg._sum.amountGross || 0,
            net_revenue: txAgg._sum.amountNet || 0,
            tickets_sold: txAgg._count.id || 0, // Using transaction count as proxy for tickets for now, or refine if strictly "tickets"
            new_customers: newCustomers,
            points_circulating: ledgerAgg._sum.points || 0
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

// GET /dashboard/revenue-series
router.get('/revenue-series', requireAuth, async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = parseDateRange(req);

        // Group by day - Prisma doesn't support concise 'date_trunc' in groupBy easily without raw query across DBs.
        // For Postgres, we can use queryRaw.

        // Group by day - Using Postgres specific syntax with correct mapped column names
        const series = await prisma.$queryRaw`
            SELECT 
                "purchase_date"::date as date, 
                SUM("amount_gross") as gross, 
                SUM("amount_net") as net 
            FROM transactions 
            WHERE "purchase_date" >= ${startDate} 
              AND "purchase_date" <= ${endDate}
              AND "status"::text = 'CONFIRMED'
            GROUP BY "purchase_date"::date
            ORDER BY "purchase_date"::date ASC
        `;

        res.json(series);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch revenue series' });
    }
});

// GET /dashboard/revenue-split
router.get('/revenue-split', requireAuth, async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = parseDateRange(req);

        const byProduct = await prisma.transaction.groupBy({
            by: ['productType'],
            where: {
                purchaseDate: { gte: startDate, lte: endDate },
                status: 'CONFIRMED'
            },
            _sum: { amountNet: true }
        });

        const byChannel = await prisma.transaction.groupBy({
            by: ['channel'],
            where: {
                purchaseDate: { gte: startDate, lte: endDate },
                status: 'CONFIRMED'
            },
            _sum: { amountNet: true }
        });

        res.json({
            by_product: byProduct,
            by_channel: byChannel
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch split' });
    }
});

// GET /dashboard/top-customers
router.get('/top-customers', requireAuth, async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = parseDateRange(req);
        const limit = Number(req.query.limit) || 5;

        // Top spenders
        const top = await prisma.transaction.groupBy({
            by: ['customerId'],
            where: {
                purchaseDate: { gte: startDate, lte: endDate },
                status: 'CONFIRMED'
            },
            _sum: { amountNet: true },
            _count: { id: true },
            orderBy: {
                _sum: { amountNet: 'desc' }
            },
            take: limit
        });

        // Enrich with customer details (Optimized: No N+1)
        const customerIds = top.map(t => t.customerId);
        const customers = await prisma.customer.findMany({
            where: { id: { in: customerIds } },
            select: { id: true, name: true, phone: true, tier: true }
        });

        const customerMap = new Map(customers.map(c => [c.id, c]));

        const enriched = top.map(t => ({
            ...t,
            customer: customerMap.get(t.customerId)
        }));

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top customers' });
    }
});

// GET /dashboard/ops
router.get('/ops', requireAuth, async (req: Request, res: Response) => {
    try {
        // Pending Transactions
        const pendingTx = await prisma.transaction.findMany({
            where: { status: 'PENDING' },
            orderBy: { purchaseDate: 'desc' },
            take: 10,
            include: { customer: { select: { name: true, phone: true } } }
        });

        // Expiring Vouchers (Next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const today = new Date();

        const expiringVouchers = await prisma.voucher.findMany({
            where: {
                status: 'ACTIVE',
                expiryDate: {
                    gte: today,
                    lte: nextWeek
                }
            },
            orderBy: { expiryDate: 'asc' },
            take: 10
        });

        res.json({
            pending_transactions: pendingTx,
            expiring_vouchers: expiringVouchers
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ops data' });
    }
});

export default router;
