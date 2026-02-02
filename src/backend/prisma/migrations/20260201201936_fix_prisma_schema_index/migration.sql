-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('TELEGRAM', 'WEBSITE', 'MANUAL');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SUCCESS', 'FAIL');

-- AlterEnum
ALTER TYPE "VoucherStatus" ADD VALUE 'PENDING_VALIDATION';

-- AlterTable
ALTER TABLE "point_rules" ALTER COLUMN "ticket_multiplier" SET DEFAULT 1.0,
ALTER COLUMN "combo_multiplier" SET DEFAULT 1.5;

-- AlterTable
ALTER TABLE "vouchers" ADD COLUMN     "last_checked_at" TIMESTAMP(3),
ADD COLUMN     "max_usage" INTEGER,
ADD COLUMN     "raw_text" TEXT,
ADD COLUMN     "source_id" TEXT,
ADD COLUMN     "used_count" INTEGER DEFAULT 0,
ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "voucher_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "config_json" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voucher_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_job_logs" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "found_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voucher_job_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "voucher_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_job_logs" ADD CONSTRAINT "voucher_job_logs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "voucher_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
