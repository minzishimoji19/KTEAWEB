-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "cinema_name" TEXT,
ADD COLUMN     "discount_percent" DOUBLE PRECISION,
ALTER COLUMN "ticket_count" DROP NOT NULL,
ALTER COLUMN "ticket_count" SET DEFAULT 1,
ALTER COLUMN "channel" DROP NOT NULL,
ALTER COLUMN "channel" SET DEFAULT 'OFFLINE';
