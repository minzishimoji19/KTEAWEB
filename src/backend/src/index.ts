import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security
app.use(helmet());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ ok: true });
});

// Routes
import customerRoutes from './routes/customers';
import transactionRoutes from './routes/transactions';
import loyaltyRoutes from './routes/loyalty';
import { setupCronJobs } from './jobs/cron';
import automationRoutes from './routes/automation';
import voucherRoutes from './routes/vouchers';
import dashboardRoutes from './routes/dashboard';
import { requireAuth } from './middleware/auth';

app.use('/auth', authRoutes); // Public
app.use('/customers', requireAuth, customerRoutes);
app.use('/transactions', requireAuth, transactionRoutes);
app.use('/loyalty', requireAuth, loyaltyRoutes);
app.use('/vouchers', requireAuth, voucherRoutes);
app.use('/dashboard', requireAuth, dashboardRoutes);
app.use('/automation', requireAuth, automationRoutes);
import internalVoucherRoutes from './routes/internal/vouchers';
app.use('/internal/vouchers', requireAuth, internalVoucherRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    setupCronJobs();
});
