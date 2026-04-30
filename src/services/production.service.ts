import db from '@/lib/db';
import { StockService } from './stock.service';

export const productionService = {
  // Get all production entries
  async getAllProduction() {
    return db.production.findMany({
      include: {
        material: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  },

  // Get production entries by date
  async getProductionByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.production.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        material: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  },

  // Get production entries by operator
  async getProductionByOperator(operatorName: string) {
    return db.production.findMany({
      where: {
        operator_name: operatorName,
      },
      include: {
        material: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  },

  // Get production entries by size
  async getProductionBySize(size_mm: number) {
    return db.production.findMany({
      where: {
        size_mm,
      },
      include: {
        material: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  },

  // Get single production entry by ID
  async getProductionById(id: number) {
    return db.production.findUnique({
      where: { id },
      include: {
        material: true,
      },
    });
  },

  // Create new production entry
  async createProduction(data: any) {
    // Verify material exists
    const material = await db.material.findUnique({
      where: { id: data.materialId },
    });

    if (!material) {
      throw new Error(`Material with ID ${data.materialId} not found`);
    }

    // Calculate total production: tapes × meters_per_tape
    const total_production = data.tapes * data.meters_per_tape;

    const entry = await db.production.create({
      data: {
        date: new Date(data.date),
        operator_name: data.operator_name,
        materialId: data.materialId,
        size_mm: data.size_mm,
        tapes: data.tapes,
        meters_per_tape: data.meters_per_tape,
        needle_break: data.needle_break || 0,
        total_production,
      },
      include: {
        material: true,
      },
    });

    // Update stock for both material (consumed) and product (produced)
    await StockService.recalculateStock(entry.date, entry.materialId);
    await StockService.recalculateStock(entry.date, undefined, entry.size_mm);

    return entry;
  },

  // Update production entry
  async updateProduction(id: number, data: any) {
    const existing = await db.production.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Production entry not found');
    }

    // If tapes or meters_per_tape changed, recalculate total_production
    let updateData: Record<string, unknown> = { ...data };

    if (data.tapes !== undefined || data.meters_per_tape !== undefined) {
      const tapes = data.tapes ?? existing.tapes;
      const metersPerTape = data.meters_per_tape ?? existing.meters_per_tape;
      updateData.total_production = tapes * metersPerTape;
    }

    // Verify material exists if materialId is being changed
    if (data.materialId && data.materialId !== existing.materialId) {
      const material = await db.material.findUnique({
        where: { id: data.materialId },
      });
      if (!material) {
        throw new Error(`Material with ID ${data.materialId} not found`);
      }
    }

    const entry = await db.production.update({
      where: { id },
      data: updateData,
      include: {
        material: true,
      },
    });

    // Update stock for current date/material/size
    await StockService.recalculateStock(entry.date, entry.materialId);
    await StockService.recalculateStock(entry.date, undefined, entry.size_mm);

    // If date, material, or size changed, update old records
    if (existing.date.getTime() !== entry.date.getTime() || 
        existing.materialId !== entry.materialId || 
        existing.size_mm !== entry.size_mm) {
      await StockService.recalculateStock(existing.date, existing.materialId);
      await StockService.recalculateStock(existing.date, undefined, existing.size_mm);
    }

    return entry;
  },

  // Delete production entry
  async deleteProduction(id: number) {
    const existing = await db.production.findUnique({ where: { id } });
    if (!existing) throw new Error('Production entry not found');

    const entry = await db.production.delete({
      where: { id },
    });

    // Update stock
    await StockService.recalculateStock(entry.date, entry.materialId);
    await StockService.recalculateStock(entry.date, undefined, entry.size_mm);

    return entry;
  },

  // Get production summary for a date range
  async getProductionSummary(startDate: Date, endDate: Date) {
    return db.production.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        material: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  },
};
