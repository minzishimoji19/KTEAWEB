import { PrismaClient, Transaction, PointRule, Customer, Tier, PointLedgerType } from '@prisma/client';

const prisma = new PrismaClient();

export class LoyaltyService {

    /**
     * Get currently active rule (latest created)
     * If none exists, creates a default one.
     */
    static async getActiveRule(): Promise<PointRule> {
        const rule = await prisma.pointRule.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (rule) return rule;

        // Create default if missing
        return await prisma.pointRule.create({
            data: {
                conversionUnit: 10000,
                ticketMultiplier: 1.0,
                comboMultiplier: 1.5,
                appWebBonus: 0.1,
                pointsExpiryMonths: 12
            }
        });
    }

    /**
     * Calculate and Record Points for a Confirmed Transaction
     */
    static async earnPoints(transactionId: string): Promise<void> {
        const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
        if (!tx || tx.status !== 'CONFIRMED') return;

        // Check if already earned
        const existing = await prisma.pointLedger.findFirst({
            where: { transactionId: tx.id, type: 'EARN' }
        });
        if (existing) return;

        const rule = await LoyaltyService.getActiveRule();

        // Logic: base_points = floor(amount_net / conversion_unit)
        const basePoints = Math.floor(tx.amountNet / rule.conversionUnit);

        if (basePoints <= 0) return;

        let multiplier = Number(tx.productType === 'TICKET' ? rule.ticketMultiplier : rule.comboMultiplier);
        let bonus = 0;

        if (tx.channel === 'APP' || tx.channel === 'WEB') {
            bonus = Number(rule.appWebBonus);
        }

        // earned_points = floor(base_points * (multiplier + bonus))
        const earnedPoints = Math.floor(basePoints * (multiplier + bonus));

        if (earnedPoints <= 0) return;

        // Expiry date
        const expiredAt = new Date();
        expiredAt.setMonth(expiredAt.getMonth() + rule.pointsExpiryMonths);

        // Create Ledger & Update Customer
        await prisma.$transaction(async (txPrisma) => {
            await txPrisma.pointLedger.create({
                data: {
                    customerId: tx.customerId,
                    transactionId: tx.id,
                    points: earnedPoints,
                    type: 'EARN',
                    ruleSnapshot: rule as any,
                    expiredAt
                }
            });

            await txPrisma.customer.update({
                where: { id: tx.customerId },
                data: { totalPoints: { increment: earnedPoints } }
            });
        });

        console.log(`[Loyalty] Customer ${tx.customerId} earned ${earnedPoints} points.`);
    }

    /**
     * Check and Update Tier based on 12-month spending
     */
    static async checkTier(customerId: string): Promise<void> {
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        // Calculate total spending in last 12 months
        const aggregations = await prisma.transaction.aggregate({
            _sum: { amountNet: true },
            where: {
                customerId,
                status: 'CONFIRMED',
                purchaseDate: { gte: oneYearAgo }
            }
        });

        const totalSpend = aggregations._sum.amountNet || 0;
        let newTier: Tier = 'BRONZE';

        if (totalSpend >= 10000000) newTier = 'DIAMOND';
        else if (totalSpend >= 5000000) newTier = 'GOLD';
        else if (totalSpend >= 2000000) newTier = 'SILVER';

        const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) return;

        if (customer.tier !== newTier) {
            await prisma.$transaction(async (txPrisma) => {
                // Close old tier history
                await txPrisma.tierHistory.updateMany({
                    where: { customerId, toDate: null },
                    data: { toDate: now }
                });

                // Create new tier history
                await txPrisma.tierHistory.create({
                    data: {
                        customerId,
                        tier: newTier,
                        fromDate: now
                    }
                });

                // Update customer
                await txPrisma.customer.update({
                    where: { id: customerId },
                    data: { tier: newTier }
                });
            });
            console.log(`[Loyalty] Customer ${customerId} upgraded to ${newTier}`);
        }
    }

    /**
     * Manual Redeem Points
     */
    static async redeemPoints(customerId: string, points: number): Promise<void> {
        // Atomic Check-and-Update to prevent race conditions
        await prisma.$transaction(async (txPrisma) => {
            // 1. Try to decrement points ONLY if balance >= points
            const updateResult = await txPrisma.customer.updateMany({
                where: {
                    id: customerId,
                    totalPoints: { gte: points }
                },
                data: {
                    totalPoints: { decrement: points }
                }
            });

            // 2. If no record updated, it means either customer missing OR insufficient points
            if (updateResult.count === 0) {
                const customerExists = await txPrisma.customer.findUnique({ where: { id: customerId } });
                if (!customerExists) throw new Error("Customer not found");
                throw new Error("Insufficient points");
            }

            // 3. Create Ledger Entry
            await txPrisma.pointLedger.create({
                data: {
                    customerId,
                    points: -points,
                    type: 'REDEEM'
                }
            });
        });
    }

    /**
     * Get Top Loyal Customers (Rolling 12 Months)
     */
    static async getTopCustomers(limit: number = 10) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        // We need to aggregate transactions first
        // Since we can't easily join aggregates with other tables in Prisma efficiently for sorting,
        // we'll use a raw query for best performance and flexibility.

        const topCustomers = await prisma.$queryRaw<any[]>`
            SELECT 
                c.id as customer_id,
                c.name,
                c.phone,
                c.tier,
                c.total_points as points_available,
                COALESCE(SUM(t.amount_net), 0) as net_spend,
                COUNT(t.id) as transactions_count,
                COALESCE(SUM(CASE WHEN t.product_type = 'TICKET' THEN 1 ELSE 0 END), 0) as tickets
            FROM customers c
            LEFT JOIN transactions t ON c.id = t.customer_id 
                AND t.status = 'CONFIRMED' 
                AND t.purchase_date >= ${oneYearAgo}
            GROUP BY c.id
            ORDER BY net_spend DESC, transactions_count DESC
            LIMIT ${limit}
        `;

        // Map bigints to numbers if necessary (Prisma returns BigInt for raw sums)
        return topCustomers.map(c => ({
            ...c,
            net_spend: Number(c.net_spend),
            transactions_count: Number(c.transactions_count),
            tickets: Number(c.tickets)
        }));
    }

    /**
     * Redeem Voucher
     */
    static async redeemVoucher(customerId: string, rewardId: string) {
        // Hardcoded Reward Catalog (MVP)
        const CATALOG: Record<string, { points: number, discount: number }> = {
            'DISC10K10P': { points: 10000, discount: 10 },
            'DISC20K20P': { points: 20000, discount: 20 }
        };

        const reward = CATALOG[rewardId];
        if (!reward) throw new Error("Invalid Reward ID");

        const pointsCost = reward.points;

        return await prisma.$transaction(async (txPrisma) => {
            // 1. Decrement Points
            const updateResult = await txPrisma.customer.updateMany({
                where: {
                    id: customerId,
                    totalPoints: { gte: pointsCost }
                },
                data: {
                    totalPoints: { decrement: pointsCost }
                }
            });

            if (updateResult.count === 0) {
                const customerExists = await txPrisma.customer.findUnique({ where: { id: customerId } });
                if (!customerExists) throw new Error("Customer not found");
                throw new Error("Insufficient points");
            }

            // 2. Generate Voucher Code
            const code = `RV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            // 3. Create Voucher
            const voucher = await txPrisma.rewardVoucher.create({
                data: {
                    customerId,
                    rewardType: 'DISCOUNT_PERCENT',
                    discountPercent: reward.discount,
                    pointsCost: pointsCost,
                    code,
                    status: 'ISSUED',
                    expiresAt
                }
            });

            // 4. Create Ledger
            await txPrisma.pointLedger.create({
                data: {
                    customerId,
                    points: -pointsCost,
                    type: 'REDEEM',
                    ruleSnapshot: { rewardId, voucherCode: code } // Storing basic meta
                }
            });

            const customer = await txPrisma.customer.findUnique({
                where: { id: customerId },
                select: { totalPoints: true }
            });

            return {
                voucher,
                pointsRemaining: customer?.totalPoints || 0
            };
        });
    }
}
