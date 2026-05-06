import db from "@/lib/db";
import { startOfDay } from "date-fns";

export class StockService {
  /**
   * Get the last available stock balance before the given date
   * @param date Date to look before
   * @param materialId Optional material ID for raw material stock
   * @param size_mm Optional size for finished goods stock
   * @param colour Optional colour for finished goods stock
   */
  static async getPreviousBalance(date: Date, materialId: number | null = null, size_mm: number | null = null, colour: string | null = null) {
    const prevStock = await db.stock.findFirst({
      where: {
        date: {
          lt: startOfDay(date),
        },
        materialId: materialId,
        size_mm: size_mm,
        colour: colour,
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

    // Sum all purchases for this material on this date
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

    const purchase = purchaseAgg._sum?.quantity_kg ?? 0;
    const opening_stock = await this.getPreviousBalance(date, materialId, null);

    // Raw material balance = opening stock + purchased quantity
    // (Production consumption is not tracked per batch in the current system)
    const balance = opening_stock + purchase;

    return {
      date: dayStart,
      materialId,
      size_mm: null,
      opening_stock,
      purchase,
      production: 0,
      sales: 0,
      balance,
    };
  }

  /**
   * Calculate stock for a specific product size and colour on a given date
   */
  static async calculateProductStock(date: Date, size_mm: number, colour: string | null = null) {
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    // Sum all production for this size and colour on this date (from NEW Product table)
    const productAgg = await db.product.aggregate({
      where: {
        size_mm,
        colour: colour,
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
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      _sum: {
        quantity_kg: true,
      },
    });

    // Sum all sales for this size and colour on this date
    const salesAgg = await db.sales.aggregate({
      where: {
        size_mm,
        colour: colour,
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
    const opening_stock = await this.getPreviousBalance(date, null, size_mm, colour);

    // Formula for product: balance = opening + purchase + production - sales
    const balance = opening_stock + purchase + production - sales;

    return {
      date: dayStart,
      materialId: null,
      size_mm,
      colour: colour,
      opening_stock,
      purchase,
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
    size_mm: number | null;
    colour?: string | null;
    opening_stock: number;
    purchase: number;
    production: number;
    sales: number;
    balance: number;
  }) {
    // Manually find existing record since Prisma upsert has issues with nulls in composite keys
    const existing = await db.stock.findFirst({
      where: {
        date: data.date,
        materialId: data.materialId,
        size_mm: data.size_mm,
        colour: data.colour || null,
      },
    });

    if (existing) {
      return await db.stock.update({
        where: { id: existing.id },
        data: {
          opening_stock: data.opening_stock,
          purchase: data.purchase,
          production: data.production,
          sales: data.sales,
          balance: data.balance,
        },
      });
    } else {
      return await db.stock.create({
        data,
      });
    }
  }

  /**
   * Main entry point to update stock for a specific item and date
   */
  static async recalculateStock(date: Date, materialId?: number, size_mm?: number, colour?: string | null) {
    if (materialId !== undefined) {
      const stockData = await this.calculateMaterialStock(date, materialId);
      await this.upsertStock(stockData);
    }
    
    if (size_mm !== undefined) {
      const stockData = await this.calculateProductStock(date, size_mm, colour || null);
      await this.upsertStock(stockData);
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

    // Get all unique sizes and colours for products on this date
    const products = await db.product.findMany({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      select: { size_mm: true, colour: true },
      distinct: ['size_mm', 'colour'],
    });

    // Get all unique sizes and colours for sales on this date
    const sales = await db.sales.findMany({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      select: { size_mm: true, colour: true },
      distinct: ['size_mm', 'colour'],
    });

    // Combine unique size-colour combinations from both product and sales
    const uniqueCombinations = new Map<string, { size_mm: number; colour: string | null }>();
    
    for (const p of products) {
      const key = `${p.size_mm}-${p.colour || 'null'}`;
      uniqueCombinations.set(key, { size_mm: p.size_mm, colour: p.colour });
    }
    
    for (const s of sales) {
      const key = `${s.size_mm}-${s.colour || 'null'}`;
      uniqueCombinations.set(key, { size_mm: s.size_mm, colour: s.colour });
    }

    // Recalculate stock for all materials
    for (const p of purchases) {
      await this.recalculateStock(date, p.materialId ?? undefined);
    }

    // Recalculate stock for all size-colour combinations
    for (const combo of uniqueCombinations.values()) {
      await this.recalculateStock(date, undefined, combo.size_mm, combo.colour);
    }
  }
}
