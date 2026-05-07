import db from "@/lib/db";
import { startOfDay } from "date-fns";

export class StockService {
  /**
   * Get the last available stock balance before the given date
   * @param date Date to look before
   * @param materialId Optional material ID for raw material stock
   * @param size_mm Optional size for finished goods stock
   * @param colour Optional colour for finished goods stock
   * @param product_type Optional product type for finished goods stock
   */
  static async getPreviousBalance(
    date: Date, 
    materialId: number | null = null, 
    size_mm: string | null = null, 
    colour: string | null = null,
    product_type: string | null = null
  ) {
    const prevStock = await db.stock.findFirst({
      where: {
        date: {
          lt: startOfDay(date),
        },
        materialId: materialId,
        size_mm: size_mm,
        colour: colour,
        product_type: product_type,
      },
      orderBy: {
        date: "desc",
      },
    });

    return prevStock?.balance ?? 0;
  }

  /**
   * Calculate stock for a specific material on a given date
   */
  static async calculateMaterialStock(date: Date, materialId: number) {
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    // 1. Sum all purchases made on this date (regardless of completion status)
    const purchaseAgg = await db.purchase.aggregate({
      where: {
        materialId,
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      _sum: {
        quantity_kg: true,
      },
    });

    // 2. Sum all items marked as 'completed' (consumed) ON THIS DATE
    // Using raw SQL to bypass Prisma client sync issues with 'completed_at'
    const consumedRes = await db.$queryRaw<any[]>`
      SELECT SUM(quantity_kg) as total 
      FROM "Purchase" 
      WHERE "materialId" = ${materialId} 
      AND "completed" = true 
      AND "completed_at" >= ${dayStart} 
      AND "completed_at" < ${dayEnd}
    `;

    const purchase = purchaseAgg._sum?.quantity_kg ?? 0;
    const consumed = Number(consumedRes[0]?.total) || 0;
    const opening_stock = await this.getPreviousBalance(date, materialId, null, null, null);

    // Raw material balance = opening stock + purchased quantity - consumed quantity
    const balance = opening_stock + purchase - consumed;

    return {
      date: dayStart,
      materialId,
      size_mm: null,
      colour: null,
      product_type: null,
      opening_stock,
      purchase,
      consumed,
      production: 0,
      sales: 0,
      balance,
    };
  }

  /**
   * Calculate stock for a specific product size, colour and type on a given date
   */
  static async calculateProductStock(date: Date, size_mm: string, colour: string | null = null, product_type: string | null = null) {
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    // Sum all production for this size, colour and type on this date
    const productAgg = await db.product.aggregate({
      where: {
        size_mm,
        colour: colour,
        product_type: product_type,
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Sum all purchases for this size on this date (if any)
    const purchaseAgg = await db.purchase.aggregate({
      where: {
        size_mm,
        // For finished goods, we don't use 'completed' for stock logic yet 
        // as they are tracked via sales, but we could add it if needed.
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      _sum: {
        quantity_kg: true,
      },
    });

    // Sum all sales for this size, colour and type on this date
    const salesAgg = await db.sales.aggregate({
      where: {
        size_mm,
        colour: colour,
        product_type: product_type,
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const production = productAgg._sum?.quantity ?? 0;
    const purchase = purchaseAgg._sum?.quantity_kg ?? 0;
    const sales = salesAgg._sum?.quantity ?? 0;
    const opening_stock = await this.getPreviousBalance(date, null, size_mm, colour, product_type);

    // Formula for product: balance = opening + purchase + production - sales
    const balance = opening_stock + purchase + production - sales;

    return {
      date: dayStart,
      materialId: null,
      size_mm,
      colour: colour,
      product_type: product_type,
      opening_stock,
      purchase,
      consumed: 0,
      production,
      sales,
      balance,
    };
  }

  /**
   * Upsert stock record handling potential null values in the composite key
   */
  static async upsertStock(data: {
    date: Date;
    materialId: number | null;
    size_mm: string | null;
    colour?: string | null;
    product_type?: string | null;
    opening_stock: number;
    purchase: number;
    consumed: number;
    production: number;
    sales: number;
    balance: number;
  }) {
    // Manually find existing record since Prisma upsert has issues with nulls in composite keys
    // Manually find existing record
    // Using relation 'material' instead of 'materialId' to bypass client sync issues
    const existing = await db.stock.findFirst({
      where: {
        date: data.date,
        material: data.materialId ? { id: data.materialId } : null,
        size_mm: data.size_mm,
        colour: data.colour || null,
        product_type: data.product_type || null,
      },
    });

    if (existing) {
      const stock = await db.stock.update({
        where: { id: existing.id },
        data: {
          opening_stock: data.opening_stock,
          purchase: data.purchase,
          // 'consumed' might be unknown to ORM, so we'll update it via raw SQL later if needed
          production: data.production,
          sales: data.sales,
          balance: data.balance,
        },
      });
      
      // Update consumed via raw SQL
      await db.$executeRaw`UPDATE "Stock" SET "consumed" = ${data.consumed} WHERE id = ${stock.id}`;
      return stock;
    } else {
      const stock = await db.stock.create({
        data: {
          date: data.date,
          material: data.materialId ? { connect: { id: data.materialId } } : undefined,
          size_mm: data.size_mm,
          colour: data.colour || null,
          product_type: data.product_type || null,
          opening_stock: data.opening_stock,
          purchase: data.purchase,
          // 'consumed' might be unknown to ORM
          production: data.production,
          sales: data.sales,
          balance: data.balance,
        },
      });

      // Update consumed via raw SQL
      await db.$executeRaw`UPDATE "Stock" SET "consumed" = ${data.consumed} WHERE id = ${stock.id}`;
      return stock;
    }
  }

  /**
   * Main entry point to update stock for a specific item and date, 
   * and propagate the change to future records.
   */
  static async recalculateStock(
    date: Date, 
    materialId?: number, 
    size_mm?: string, 
    colour?: string | null,
    product_type?: string | null
  ) {
    const dayStart = startOfDay(date);
    
    // 1. Update the record for the target date
    if (materialId !== undefined) {
      const stockData = await this.calculateMaterialStock(dayStart, materialId);
      await this.upsertStock(stockData);
    }
    
    if (size_mm !== undefined) {
      const stockData = await this.calculateProductStock(dayStart, size_mm, colour || null, product_type || null);
      await this.upsertStock(stockData);
    }

    // 2. Propagate to all EXISTING future records for the same item
    let currentBalance = 0;
    if (materialId !== undefined) {
      currentBalance = await this.calculateMaterialStock(dayStart, materialId).then(d => d.balance);
    } else if (size_mm !== undefined) {
      currentBalance = await this.calculateProductStock(dayStart, size_mm, colour || null, product_type || null).then(d => d.balance);
    }

    const futureRecords = await db.stock.findMany({
      where: {
        date: { gt: dayStart },
        materialId: materialId !== undefined ? materialId : null,
        size_mm: size_mm !== undefined ? size_mm : null,
        colour: colour || null,
        product_type: product_type || null,
      },
      orderBy: { date: 'asc' },
    });

    for (const record of futureRecords) {
      // For each future record, opening_stock is the balance we just computed
      const opening_stock = currentBalance;
      const balance = opening_stock + (record.purchase || 0) + (record.production || 0) - (record.consumed || 0) - (record.sales || 0);
      
      await db.stock.update({
        where: { id: record.id },
        data: {
          opening_stock,
          balance
        }
      });
      
      currentBalance = balance;
    }
  }

  /**
   * Recalculate stock for a specific date (optional but recommended)
   */
  static async recalculateStockForDate(date: Date) {
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    // Get all materials that have entries on this date
    const purchases = await db.purchase.findMany({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      select: { materialId: true },
      distinct: ['materialId'],
    });

    // Get all unique sizes, colours, and types for products on this date
    const products = await db.product.findMany({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      select: { size_mm: true, colour: true, product_type: true },
      distinct: ['size_mm', 'colour', 'product_type'],
    });

    // Get all unique sizes, colours, and types for sales on this date
    const sales = await db.sales.findMany({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      select: { size_mm: true, colour: true, product_type: true },
      distinct: ['size_mm', 'colour', 'product_type'],
    });

    // Combine unique size-colour-type combinations from both product and sales
    const uniqueCombinations = new Map<string, { size_mm: string; colour: string | null; product_type: string | null }>();
    
    for (const p of products) {
      const key = `${p.size_mm}-${p.colour || 'null'}-${p.product_type || 'null'}`;
      uniqueCombinations.set(key, { size_mm: p.size_mm, colour: p.colour, product_type: p.product_type });
    }
    
    for (const s of sales) {
      const key = `${s.size_mm}-${s.colour || 'null'}-${s.product_type || 'null'}`;
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, { size_mm: s.size_mm, colour: s.colour, product_type: s.product_type });
      }
    }

    // Recalculate stock for all materials
    for (const p of purchases) {
      if (p.materialId) {
        await this.recalculateStock(date, p.materialId);
      }
    }

    // Recalculate stock for all size-colour-type combinations
    for (const combo of uniqueCombinations.values()) {
      await this.recalculateStock(date, undefined, combo.size_mm, combo.colour, combo.product_type);
    }
  }
}
