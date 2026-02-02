-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND');

-- CreateEnum
CREATE TYPE "PointLedgerType" AS ENUM ('EARN', 'REDEEM', 'EXPIRE');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "tier" "Tier" NOT NULL DEFAULT 'BRONZE',
ADD COLUMN     "total_points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "point_rules" (
    "id" TEXT NOT NULL,
    "conversion_unit" INTEGER NOT NULL DEFAULT 10000,
    "ticket_multiplier" DECIMAL(65,30) NOT NULL DEFAULT 0.05,
    "combo_multiplier" DECIMAL(65,30) NOT NULL DEFAULT 0.08,
    "app_web_bonus" DECIMAL(65,30) NOT NULL DEFAULT 0.1,
    "points_expiry_months" INTEGER NOT NULL DEFAULT 12,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_ledger" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "points" INTEGER NOT NULL,
    "type" "PointLedgerType" NOT NULL,
    "rule_snapshot" JSONB,
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tier_history" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "tier" "Tier" NOT NULL,
    "from_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to_date" TIMESTAMP(3),

    CONSTRAINT "tier_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "point_ledger" ADD CONSTRAINT "point_ledger_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_ledger" ADD CONSTRAINT "point_ledger_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_history" ADD CONSTRAINT "tier_history_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
