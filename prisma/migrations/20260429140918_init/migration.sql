-- DropIndex
DROP INDEX "inventory_ledger_size_mm_idx";

-- AlterTable
ALTER TABLE "inward" ADD COLUMN "quantity_box" REAL;

-- AlterTable
ALTER TABLE "production" ADD COLUMN "remark" TEXT;
