# Navin Tapes Manufacturing System - Database Schema

## Overview

Production-ready PostgreSQL schema designed for a tape manufacturing system. Tracks raw materials, production, and daily inventory balances.

**Business Flow:**
```
PURCHASE (Raw Materials) → STOCK → PRODUCTION → STOCK → DELIVERY
```

---

## Models

### 1. **Material**
Represents material types used in manufacturing.

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-increment primary key |
| name | String (UNIQUE) | Material name (e.g., Lycra, Rubber) |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Relations:**
- One-to-Many: Purchase, Production, InventoryLedger

---

### 2. **Purchase**
Records incoming raw materials with quality checks.

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-increment primary key |
| date | DateTime | Purchase entry date |
| invoice_no | String | Purchase invoice number |
| supplier | String | Supplier name |
| materialId | Int (FK) | Reference to Material |
| quantity_kg | Float | Quantity in kilograms |
| quantity_box | Float | Quantity in boxes (optional) |
| **QC Checks** | Boolean | Quality check flags |
| packing_ok | Boolean | Packaging quality |
| winding_uneven | Boolean | Winding uniformity |
| colour_shade_ok | Boolean | Color consistency |
| dnk_og_ok | Boolean | DNK/OG quality check |
| stain | Boolean | Stain presence |
| strength_ok | Boolean | Material strength |
| stretchability_ok | Boolean | Stretchability test |
| remarks | String | Optional notes |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Indexes:** date, materialId
**Relations:** Many-to-One with Material (onDelete: Cascade)

---

### 3. **Production**
Records daily production output.

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-increment primary key |
| date | DateTime | Production date |
| operator_name | String | Operator name |
| materialId | Int (FK) | Reference to Material |
| size_mm | Int | Tape size in millimeters |
| tapes | Int | Number of tapes produced |
| meters_per_tape | Int | Meters per tape |
| needle_break | Int | Number of needle breaks |
| total_production | Int | tapes × meters_per_tape (in meters) |
| remark | String | Optional production notes |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Unique Constraint:** (date, operator_name, materialId, size_mm)
**Indexes:** date, materialId
**Relations:** Many-to-One with Material (onDelete: Cascade)

---

### 4. **InventoryLedger**
Daily stock balance tracking per material and tape size.

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-increment primary key |
| date | DateTime | Ledger date |
| materialId | Int (FK) | Reference to Material |
| size_mm | Int | Tape size in millimeters |
| opening_stock | Float | Opening balance (in meters) |
| inward | Float | Purchase quantity (in meters) |
| production | Float | Production output (in meters) |
| delivery | Float | Delivery/consumption (in meters) |
| balance | Float | **opening + purchase + production - delivery** |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Unique Constraint:** (date, materialId, size_mm) - One record per date+material+size
**Indexes:** date, materialId
**Relations:** Many-to-One with Material (onDelete: Cascade)

---

## Key Relationships

```
Material (1) ──────────── (N) Purchase
              ├──────────── (N) Production
              └──────────── (N) InventoryLedger
```

---

## Setup Instructions

### 1. **Update Database Connection**

Update `.env` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://username:password@host:5432/navin_tapes?sslmode=require"
```

For **Supabase**, the URL format is:
```
postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres?sslmode=require
```

### 2. **Push Schema to Database**

```bash
npm run prisma:push
```

This creates all tables in your PostgreSQL database.

### 3. **Generate Prisma Client**

```bash
npm run prisma:generate
```

### 4. **Seed Sample Data**

```bash
npm run prisma:seed
```

This populates the database with:
- 5 materials (Lycra, Rubber, Cotton, Polyester, Nylon)
- 3 sample purchase entries
- 3 sample production entries
- 3 sample inventory ledger entries

### 5. **One-Command Setup**

Run all steps at once:

```bash
npm run prisma:setup
```

---

## Usage in Backend Services

### Example: Get Production for Date

```typescript
import { db } from '@/lib/db';

const production = await db.production.findMany({
  where: {
    date: { gte: startDate, lte: endDate },
  },
  include: {
    material: true, // Include material details
  },
});
```

### Example: Get Current Stock

```typescript
const inventory = await db.inventoryLedger.findMany({
  where: {
    date: new Date(), // Today's date
  },
  include: {
    material: true,
  },
});
```

### Example: Create Purchase Entry

```typescript
const purchase = await db.purchase.create({
  data: {
    date: new Date(),
    invoice_no: "INV-001",
    supplier: "Supplier Name",
    materialId: 1,
    quantity_kg: 100,
    quantity_box: 10,
    packing_ok: true,
    colour_shade_ok: true,
    remarks: "Good quality",
  },
});
```

---

## Notes

- **Cascading Deletes:** If a Material is deleted, all related Purchase, Production, and InventoryLedger records are also deleted.
- **Balance Calculation:** Always calculate balance in the backend/API before storing.
- **Indexes:** Applied on `date` and `materialId` for faster queries.
- **Unique Constraints:** 
  - Production: No duplicate entries per (date + operator + material + size)
  - InventoryLedger: One record per (date + material + size)

---

## Database Migrations

Migrations are stored in `prisma/migrations/`. Each migration tracks schema changes:

```
prisma/migrations/
├── 20260429000000_initial_schema/
│   └── migration.sql
```

To create new migrations after schema changes:
```bash
npx prisma migrate dev --name <migration_name>
```

---

## Production Checklist

- ✅ Schema normalized and clean
- ✅ Proper relations with foreign keys
- ✅ Indexes for performance
- ✅ Unique constraints for data integrity
- ✅ Cascade deletes configured
- ✅ Sample data for testing
- ✅ Documentation complete

---

**Last Updated:** April 29, 2026
