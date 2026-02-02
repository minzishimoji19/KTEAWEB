
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ingestVouchers } from '../services/automation';

const router = Router();
const prisma = new PrismaClient();

// GET /automation/sources
router.get('/sources', async (req, res) => {
    const sources = await prisma.voucherSource.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json(sources);
});

// POST /automation/sources
router.post('/sources', async (req, res) => {
    const { name, type, parserConfig, isEnabled } = req.body;
    try {
        const source = await prisma.voucherSource.create({
            data: {
                name,
                type,
                parserConfig: parserConfig || {}, // Ensure parserConfig is not undefined if optional 
                isEnabled: isEnabled ?? true
            }
        });
        res.status(201).json(source);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create source' });
    }
});

// PATCH /automation/sources/:id
router.patch('/sources/:id', async (req, res) => {
    const { id } = req.params;
    const { isEnabled } = req.body;
    try {
        const source = await prisma.voucherSource.update({
            where: { id },
            data: { isEnabled }
        });
        res.json(source);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update source' });
    }
});

// GET /automation/logs
router.get('/logs', async (req, res) => {
    const logs = await prisma.voucherJobLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { source: { select: { name: true } } }
    });
    res.json(logs);
});

// POST /automation/run
router.post('/run', async (req, res) => {
    // Run async, don't wait
    ingestVouchers().catch(console.error);
    res.json({ message: 'Job triggered' });
});

export default router;
