/*
  Warnings:

  - You are about to drop the column `config_json` on the `voucher_sources` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `voucher_sources` table. All the data in the column will be lost.
  - The `type` column on the `voucher_sources` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `last_checked_at` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `max_usage` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `raw_text` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `used_count` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `validated` on the `vouchers` table. All the data in the column will be lost.
  - The `status` column on the `vouchers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `discount_type` to the `vouchers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "vouchers_code_key";

-- DropIndex
DROP INDEX "vouchers_status_expiryDate_idx";

-- AlterTable
ALTER TABLE "voucher_sources" DROP COLUMN "config_json",
DROP COLUMN "is_active",
ADD COLUMN     "base_url" TEXT,
ADD COLUMN     "is_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_sync_error" TEXT,
ADD COLUMN     "last_sync_status" TEXT,
ADD COLUMN     "last_synced_at" TIMESTAMP(3),
ADD COLUMN     "parser_config" JSONB,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'HTML_LIST';

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "createdAt",
DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "last_checked_at",
DROP COLUMN "max_usage",
DROP COLUMN "note",
DROP COLUMN "platform",
DROP COLUMN "raw_text",
DROP COLUMN "updatedAt",
DROP COLUMN "used_count",
DROP COLUMN "validated",
ADD COLUMN     "apply_url" TEXT,
ADD COLUMN     "cinema_chain" TEXT NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "city" TEXT,
ADD COLUMN     "conditions" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "discount_type" TEXT NOT NULL,
ADD COLUMN     "discount_value" DOUBLE PRECISION,
ADD COLUMN     "end_at" TIMESTAMP(3),
ADD COLUMN     "internal_notes" TEXT,
ADD COLUMN     "last_tested_at" TIMESTAMP(3),
ADD COLUMN     "payment_methods" TEXT[],
ADD COLUMN     "pin" TEXT,
ADD COLUMN     "source_type" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "start_at" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled Voucher',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" TEXT,
ADD COLUMN     "verify_status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "voucher_type" TEXT NOT NULL DEFAULT 'PROMO_CODE',
ALTER COLUMN "code" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "vouchers_cinema_chain_end_at_idx" ON "vouchers"("cinema_chain", "end_at");

-- CreateIndex
CREATE INDEX "vouchers_verify_status_status_end_at_idx" ON "vouchers"("verify_status", "status", "end_at");
