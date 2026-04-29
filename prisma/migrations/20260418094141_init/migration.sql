-- CreateTable
CREATE TABLE "products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "size_mm" INTEGER NOT NULL,
    "meter_weight" REAL NOT NULL,
    "tape_count" INTEGER NOT NULL,
    "base_rate" REAL NOT NULL,
    "fixed_cost" REAL NOT NULL,
    "net_rate" REAL NOT NULL,
    "customer_rate" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "production" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "operator_name" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "size_mm" INTEGER NOT NULL,
    "tapes" INTEGER NOT NULL,
    "meters_per_tape" INTEGER NOT NULL,
    "needle_break" INTEGER NOT NULL DEFAULT 0,
    "total_production" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "production_size_mm_fkey" FOREIGN KEY ("size_mm") REFERENCES "products" ("size_mm") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "quantity_kg" REAL NOT NULL,
    "packing_ok" BOOLEAN NOT NULL DEFAULT true,
    "winding_uneven" BOOLEAN NOT NULL DEFAULT false,
    "colour_shade_ok" BOOLEAN NOT NULL DEFAULT true,
    "dnk_og_ok" BOOLEAN NOT NULL DEFAULT true,
    "stain" BOOLEAN NOT NULL DEFAULT false,
    "strength_ok" BOOLEAN NOT NULL DEFAULT true,
    "stretchability_ok" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "inventory_ledger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "size_mm" INTEGER NOT NULL,
    "opening_stock" REAL NOT NULL DEFAULT 0,
    "inward" REAL NOT NULL DEFAULT 0,
    "production" REAL NOT NULL DEFAULT 0,
    "delivery" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inventory_ledger_size_mm_fkey" FOREIGN KEY ("size_mm") REFERENCES "products" ("size_mm") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "products_size_mm_key" ON "products"("size_mm");

-- CreateIndex
CREATE INDEX "production_date_idx" ON "production"("date");

-- CreateIndex
CREATE INDEX "production_size_mm_idx" ON "production"("size_mm");

-- CreateIndex
CREATE UNIQUE INDEX "production_date_operator_name_size_mm_key" ON "production"("date", "operator_name", "size_mm");

-- CreateIndex
CREATE INDEX "inward_date_idx" ON "inward"("date");

-- CreateIndex
CREATE INDEX "inward_material_idx" ON "inward"("material");

-- CreateIndex
CREATE INDEX "inventory_ledger_date_idx" ON "inventory_ledger"("date");

-- CreateIndex
CREATE INDEX "inventory_ledger_size_mm_idx" ON "inventory_ledger"("size_mm");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_ledger_date_size_mm_key" ON "inventory_ledger"("date", "size_mm");
