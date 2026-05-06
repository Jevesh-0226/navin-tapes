-- Create Expense table for daily expense tracking (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "Expense" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add colour field to Stock table (if it doesn't exist)
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "colour" TEXT;

-- Drop existing unique constraint on Stock (if it exists)
ALTER TABLE "Stock" DROP CONSTRAINT IF EXISTS "Stock_date_materialId_size_mm_key";

-- Add new unique constraint that includes colour (if it doesn't exist)
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_date_materialId_size_mm_colour_key" UNIQUE("date", "materialId", "size_mm", "colour");

-- Create index for common queries on Expense table (if it doesn't exist)
CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date");
