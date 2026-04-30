import db from '@/lib/db';
import { StockService } from './stock.service';

export const purchaseService = {
  // Get all purchase entries
  async getAll() {
    return db.purchase.findMany({
      include: { material: true },
      orderBy: { date: 'desc' },
    });
  },

  // Get purchase by date
  async getByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.purchase.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: { material: true },
      orderBy: { created_at: 'desc' },
    });
  },

  // Get by supplier
  async getBySupplier(supplier: string) {
    return db.purchase.findMany({
      where: { supplier: { contains: supplier } },
      include: { material: true },
      orderBy: { date: 'desc' },
    });
  },

  // Get by material
  async getByMaterial(materialId: number) {
    return db.purchase.findMany({
      where: { materialId },
      include: { material: true },
      orderBy: { date: 'desc' },
    });
  },

  // Get by ID
  async getById(id: number) {
    return db.purchase.findUnique({
      where: { id },
      include: { material: true },
    });
  },

  // Create purchase entry
  async create(data: any) {
    if (data.materialId) {
      const material = await db.material.findUnique({
        where: { id: data.materialId },
      });

      if (!material) {
        throw new Error(`Material with ID ${data.materialId} not found`);
      }
    }

    const purchase = await db.purchase.create({
      data: {
        date: new Date(data.date),
        invoice_no: data.invoice_no,
        supplier: data.supplier,
        materialId: data.materialId || null,
        size_mm: data.size_mm || null,
        quantity_kg: data.quantity_kg,
        quantity_box: data.quantity_box || null,
        remarks: data.remarks || null,
      },
      include: { material: true },
    });

    // Update stock for either material or size
    if (purchase.materialId) {
      await StockService.recalculateStock(purchase.date, purchase.materialId);
    }
    if (purchase.size_mm) {
      await StockService.recalculateStock(purchase.date, undefined, purchase.size_mm);
    }

    return purchase;
  },

  // Update purchase entry
  async update(id: number, data: any) {
    const existing = await db.purchase.findUnique({ where: { id } });
    if (!existing) throw new Error('Purchase entry not found');

    if (data.materialId && data.materialId !== existing.materialId) {
      const material = await db.material.findUnique({
        where: { id: data.materialId },
      });
      if (!material) {
        throw new Error('Material not found');
      }
    }

    const purchase = await db.purchase.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.invoice_no !== undefined && { invoice_no: data.invoice_no }),
        ...(data.supplier !== undefined && { supplier: data.supplier }),
        ...(data.materialId !== undefined && { materialId: data.materialId }),
        ...(data.size_mm !== undefined && { size_mm: data.size_mm }),
        ...(data.quantity_kg !== undefined && { quantity_kg: data.quantity_kg }),
        ...(data.quantity_box !== undefined && { quantity_box: data.quantity_box }),
        ...(data.remarks !== undefined && { remarks: data.remarks || null }),
      },
      include: { material: true },
    });

    // Update stock for current state
    if (purchase.materialId) await StockService.recalculateStock(purchase.date, purchase.materialId);
    if (purchase.size_mm) await StockService.recalculateStock(purchase.date, undefined, purchase.size_mm);
    
    // If date, material or size changed, also update the old record's stock
    if (existing.date.getTime() !== purchase.date.getTime() || 
        existing.materialId !== purchase.materialId ||
        existing.size_mm !== purchase.size_mm) {
      if (existing.materialId) await StockService.recalculateStock(existing.date, existing.materialId);
      if (existing.size_mm) await StockService.recalculateStock(existing.date, undefined, existing.size_mm);
    }

    return purchase;
  },

  // Delete purchase entry
  async delete(id: number) {
    const existing = await db.purchase.findUnique({ where: { id } });
    if (!existing) throw new Error('Purchase entry not found');

    const purchase = await db.purchase.delete({ where: { id } });

    // Update stock
    if (purchase.materialId) await StockService.recalculateStock(purchase.date, purchase.materialId);
    if (purchase.size_mm) await StockService.recalculateStock(purchase.date, undefined, purchase.size_mm);

    return purchase;
  },
};
