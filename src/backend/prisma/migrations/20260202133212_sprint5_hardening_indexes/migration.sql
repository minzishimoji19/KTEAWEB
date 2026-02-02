-- CreateIndex
CREATE INDEX "transactions_status_purchase_date_idx" ON "transactions"("status", "purchase_date");

-- CreateIndex
CREATE INDEX "transactions_customer_id_idx" ON "transactions"("customer_id");

-- CreateIndex
CREATE INDEX "vouchers_status_expiryDate_idx" ON "vouchers"("status", "expiryDate");
