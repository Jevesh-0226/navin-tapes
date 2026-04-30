import db from "@/lib/db";
import { startOfDay } from "date-fns";

export class StockService {
  /**
   * Get the last available stock balance before the given date
   * @param date Date to look before
   * @param materialId Optional material ID for raw material stock
   * @param size_mm Optional size for finished goods stock
   */
  static async getPreviousBalance(date: Date, materialId: number | null = null, size_mm: number | null = null) {
    const prevStock = await db.stock.findFirst({
      where: {
        date: {
          lt: startOfDay(date),
        },
        materialId: materialId,
        size_mm: size_mm,
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

    // Sum all production for this material on this date (consumes material)
    // For now, we assume 1:1 ratio if not specified otherwise
    const productionAgg = await db.production.aggregate({
      where: {
        materialId,
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      _sum: {
        total_production: true,
      },
    });

    const purchase = purchaseAgg._sum.quantity_kg ?? 0;
    const production_consumed = productionAgg._sum.total_production ?? 0;
    const opening_stock = await this.getPreviousBalance(date, materialId, null);
    
    // Formula for raw material: balance = opening + purchase - production_consumed
    const production = 0; // Raw material doesn't have "production adds", only "consumes"
    const sales = 0;
    const balance = opening_stock + purchase - production_consumed;

    return {
      date: dayStart,
      materialId,
      size_mm: null,
      opening_stock,
      purchase,
      production: -production_consumed, // Show as negative in the ledger to show consumption
      sales,
      balance,
    };
  }

  /**
   * Calculate stock for a specific product size on a given date
   */
  static async calculateProductStock(date: Date, size_mm: number) {
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    // Sum all production for this size on this date (adds to product stock)
    const productionAgg = await db.production.aggregate({
      where: {
        size_mm,
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      _sum: {
        total_production: true,
      },
    });

    // Sum all purchases for this size on this date (e.g. bought-in finished goods)
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

    // Sum all sales for this size on this date
    const salesAgg = await db.sales.aggregate({
      where: {
        size_mm,
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const production = productionAgg._sum.total_production ?? 0;
    const purchase = purchaseAgg._sum.quantity_kg ?? 0;
    const sales = salesAgg._sum.quantity ?? 0;
    const opening_stock = await this.getPreviousBalance(date, null, size_mm);

    // Formula for product: balance = opening + purchase + production - sales
    const balance = opening_stock + purchase + production - sales;

    return {
      date: dayStart,
      materialId: null,
      size_mm,
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
  static async recalculateStock(date: Date, materialId?: number, size_mm?: number) {
    if (materialId !== undefined) {
      const stockData = await this.calculateMaterialStock(date, materialId);
      await this.upsertStock(stockData);
    }
    
    if (size_mm !== undefined) {
      const stockData = await this.calculateProductStock(date, size_mm);
      await this.upsertStock(stockData);
    }
  }

  /**
   * Recalculate stock for a specific date (optional but recommended)
   */
  static async recalculateStockForDate(date: Date) {
    // Get all materials and sizes that have entries on this date
    const purchases = await db.purchase.findMany({
      where: {
        date: {
          gte: startOfDay(date),
          lt: new Date(startOfDay(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: { materialId: true },
      distinct: ['materialId'],
    });

    const sales = await db.sales.findMany({
      where: {
        date: {
          gte: startOfDay(date),
          lt: new Date(startOfDay(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: { size_mm: true },
      distinct: ['size_mm'],
    });

    for (const p of purchases) {
      await this.recalculateStock(date, p.materialId);
    }

    for (const s of sales) {
      await this.recalculateStock(date, undefined, s.size_mm);
    }
  }
}
