-- CreateTable
CREATE TABLE "reward_vouchers" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "reward_type" TEXT NOT NULL DEFAULT 'DISCOUNT_PERCENT',
    "discount_percent" INTEGER NOT NULL,
    "points_cost" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "reward_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reward_vouchers_code_key" ON "reward_vouchers"("code");

-- CreateIndex
CREATE INDEX "reward_vouchers_customer_id_idx" ON "reward_vouchers"("customer_id");

-- CreateIndex
CREATE INDEX "reward_vouchers_code_idx" ON "reward_vouchers"("code");

-- AddForeignKey
ALTER TABLE "reward_vouchers" ADD CONSTRAINT "reward_vouchers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
