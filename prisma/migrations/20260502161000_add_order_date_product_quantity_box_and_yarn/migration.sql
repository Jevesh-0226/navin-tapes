-- Add product box quantity
ALTER TABLE "Product" ADD COLUMN "quantity_box" DOUBLE PRECISION;

-- Add order date for tracking by customer-selected date
ALTER TABLE "Order" ADD COLUMN "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Order" SET "date" = "created_at";

-- Rename seeded material to match current business terminology
UPDATE "Material" SET "name" = 'Yarn' WHERE "name" = 'Polyester';
