import db from '@/lib/db';
import { StockService } from './stock.service';

export const purchaseService = {
  // Get all purchase entries
  async getAll(take = 1000, skip = 0) {
    return db.purchase.findMany({
      select: {
        id: true,
        date: true,
        invoice_no: true,
        supplier: true,
        size_mm: true,
        quantity_kg: true,
        quantity_box: true,
        amount: true,
        completed: true,
        remarks: true,
        material: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take,
      skip,
    });
  },

  // Get purchase by date
  async getByDate(date: Date, take = 1000, skip = 0) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.purchase.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      select: {
        id: true,
        date: true,
        invoice_no: true,
        supplier: true,
        size_mm: true,
        quantity_kg: true,
        quantity_box: true,
        amount: true,
        completed: true,
        remarks: true,
        material: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
      take,
      skip,
    });
  },

  // Get by supplier
  async getBySupplier(supplier: string, take = 1000, skip = 0) {
    return db.purchase.findMany({
      where: { supplier: { contains: supplier } },
      select: {
        id: true,
        date: true,
        invoice_no: true,
        supplier: true,
        size_mm: true,
        quantity_kg: true,
        quantity_box: true,
        amount: true,
        completed: true,
        remarks: true,
        material: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take,
      skip,
    });
  },

  // Get by material
  async getByMaterial(materialId: number, take = 1000, skip = 0) {
    return db.purchase.findMany({
      where: { materialId },
      select: {
        id: true,
        date: true,
        invoice_no: true,
        supplier: true,
        size_mm: true,
        quantity_kg: true,
        quantity_box: true,
        amount: true,
        completed: true,
        remarks: true,
        material: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take,
      skip,
    });
  },

  // Get by ID
  async getById(id: number) {
    return db.purchase.findUnique({
      where: { id },
      select: {
        id: true,
        date: true,
        invoice_no: true,
        supplier: true,
        size_mm: true,
        quantity_kg: true,
        quantity_box: true,
        amount: true,
        completed: true,
        remarks: true,
        material: { select: { id: true, name: true } },
      },
    });
  },

  // Create purchase entry
  async create(data: any) {
    if (data.materialId) {
      const material = await db.material.findUnique({
        where: { id: data.materialId },
        select: { id: true, name: true },
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
        material: data.materialId ? { connect: { id: data.materialId } } : undefined,
        size_mm: data.size_mm ? String(data.size_mm) : null,
        quantity_kg: data.quantity_kg,
        quantity_box: data.quantity_box || null,
        amount: data.amount || null,
        completed: data.completed || false,
        remarks: data.remarks || null,
      },
      select: {
        id: true,
        date: true,
        invoice_no: true,
        supplier: true,
        size_mm: true,
        quantity_kg: true,
        quantity_box: true,
        amount: true,
        completed: true,
        remarks: true,
        material: { select: { id: true, name: true } },
      },
    });

    // Manually update completed_at using raw SQL
    if (data.completed) {
      await db.$executeRaw`UPDATE "Purchase" SET "completed_at" = ${new Date(data.date)} WHERE id = ${purchase.id}`;
      (purchase as any).completed_at = new Date(data.date);
    }

    // Update stock for either material or size
    const matId = purchase.material?.id;
    if (matId) {
      await StockService.recalculateStock(purchase.date, matId);
    }
    if (purchase.size_mm) {
      await StockService.recalculateStock(purchase.date, undefined, purchase.size_mm);
    }
    if (purchase.completed_at) {
      await StockService.recalculateStock(purchase.completed_at, matId || undefined);
    }

    return purchase;
  },

  // Update purchase entry
  async update(id: number, data: any) {
    const existing = await db.purchase.findUnique({ where: { id } });
    if (!existing) throw new Error('Purchase entry not found');

    const existingMatId = existing.materialId;
    if (data.materialId && data.materialId !== existingMatId) {
      const material = await db.material.findUnique({
        where: { id: data.materialId },
        select: { id: true, name: true },
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
        ...(data.materialId !== undefined && { material: data.materialId ? { connect: { id: data.materialId } } : { disconnect: true } }),
        ...(data.size_mm !== undefined && { size_mm: data.size_mm ? String(data.size_mm) : null }),
        ...(data.quantity_kg !== undefined && { quantity_kg: data.quantity_kg }),
        ...(data.quantity_box !== undefined && { quantity_box: data.quantity_box }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.completed !== undefined && { completed: data.completed }),
        ...(data.remarks !== undefined && { remarks: data.remarks || null }),
      },
      select: {
        id: true,
        date: true,
        invoice_no: true,
        supplier: true,
        size_mm: true,
        quantity_kg: true,
        quantity_box: true,
        amount: true,
        completed: true,
        remarks: true,
        material: { select: { id: true, name: true } },
      },
    });

    // Manually update completed_at using raw SQL
    if (data.completed !== undefined) {
      const completedAt = data.completed ? ((existing as any).completed_at || new Date()) : null;
      await db.$executeRaw`UPDATE "Purchase" SET "completed_at" = ${completedAt} WHERE id = ${id}`;
      (purchase as any).completed_at = completedAt;
    }

    // Update stock for current state
    const currentMatId = purchase.material?.id;
    if (purchase.size_mm) await StockService.recalculateStock(purchase.date, undefined, purchase.size_mm);
    if (purchase.completed_at) await StockService.recalculateStock(purchase.completed_at, currentMatId || undefined);
    
    // If date, material, size or completed changed, also update the old record's stock
    if (existing.date.getTime() !== purchase.date.getTime() || 
        existingMatId !== currentMatId ||
        existing.size_mm !== purchase.size_mm ||
        existing.completed !== purchase.completed ||
        (existing.completed_at?.getTime() !== purchase.completed_at?.getTime())) {
      if (existingMatId) await StockService.recalculateStock(existing.date, existingMatId);
      if (existing.size_mm) await StockService.recalculateStock(existing.date, undefined, existing.size_mm);
      if (existing.completed_at) await StockService.recalculateStock(existing.completed_at, existingMatId || undefined);
    }

    return purchase;
  },

  // Toggle completed status
  async toggleCompleted(id: number) {
    const existing = await db.purchase.findUnique({ where: { id } });
    if (!existing) throw new Error('Purchase entry not found');

    const purchase = await db.purchase.update({
      where: { id },
      data: { 
        completed: !existing.completed,
      },
      select: {
        id: true,
        date: true,
        material: { select: { id: true } },
        size_mm: true,
        completed: true,
      },
    });

    // Manually update completed_at using raw SQL
    const newCompletedAt = !existing.completed ? new Date() : null;
    await db.$executeRaw`UPDATE "Purchase" SET "completed_at" = ${newCompletedAt} WHERE id = ${id}`;
    (purchase as any).completed_at = newCompletedAt;

    // Recalculate stock for both the original purchase date and the consumption date
    const materialId = purchase.material?.id;
    if (materialId) {
      await StockService.recalculateStock(purchase.date, materialId);
      if (purchase.completed_at) {
        await StockService.recalculateStock(purchase.completed_at, materialId);
      } else if (existing.completed_at) {
        // If it was just unmarked as completed, recalculate for the old consumption date
        await StockService.recalculateStock(existing.completed_at, materialId);
      }
    }
    if (purchase.size_mm) {
      await StockService.recalculateStock(purchase.date, undefined, purchase.size_mm);
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
