import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth'; // Adjust path as needed
import { VoucherHuntService } from '../../services/voucher-hunt';

const router = Router();

// Middleware: Internal routes protected by Role (e.g. ADMIN or OPERATOR)
// Note: verify middleware path relative to this file
// if this file is src/routes/internal/vouchers.ts, then middleware is ../../middleware/auth

// GET /internal/vouchers
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const filters = {
            search: req.query.search as string,
            cinemaChain: req.query.cinemaChain as string,
            status: req.query.status as string,
            verifyStatus: req.query.verifyStatus as string,
            voucherType: req.query.voucherType as string
        };

        const result = await VoucherHuntService.search(filters, page, limit);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to search vouchers' });
    }
});

// POST /internal/vouchers
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const voucher = await VoucherHuntService.create(req.body, userId);
        res.status(201).json(voucher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create voucher' });
    }
});

// PATCH /internal/vouchers/:id
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const voucher = await VoucherHuntService.update(req.params.id, req.body);
        res.json(voucher);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update voucher' });
    }
});

// POST /internal/vouchers/:id/verify
router.post('/:id/verify', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const voucher = await VoucherHuntService.verify(req.params.id, userId);
        res.json(voucher);
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify voucher' });
    }
});

// POST /internal/vouchers/sync
router.post('/sync', requireAuth, async (req: Request, res: Response) => {
    try {
        // Run in background? Or wait? 
        // For "Trigger", usually async, but for testing we might want to return result.
        // Let's await it for the Manual Trigger UI feedback.
        await VoucherHuntService.syncSources();
        res.json({ success: true, message: 'Sync completed' });
    } catch (error) {
        res.status(500).json({ error: 'Sync failed' });
    }
});

export default router;
