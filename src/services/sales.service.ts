import db from '@/lib/db';
import { StockService } from './stock.service';

export const salesService = {
  // Get all sales entries
  async getAll() {
    return db.sales.findMany({
      orderBy: { date: 'desc' },
    });
  },

  // Get sales by date
  async getByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.sales.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  // Get by customer
  async getByCustomer(customerName: string) {
    return db.sales.findMany({
      where: { customer_name: { contains: customerName } },
      orderBy: { date: 'desc' },
    });
  },

  // Get by size
  async getBySize(size_mm: number) {
    return db.sales.findMany({
      where: { size_mm },
      orderBy: { date: 'desc' },
    });
  },

  // Get by ID
  async getById(id: number) {
    return db.sales.findUnique({
      where: { id },
    });
  },

  // Create sales entry
  async create(data: any) {
    const amount = data.quantity * data.rate;

    const sale = await db.sales.create({
      data: {
        date: new Date(data.date),
        customer_name: data.customer_name,
        size_mm: data.size_mm,
        quantity: data.quantity,
        rate: data.rate,
        amount,
        remarks: data.remarks || null,
      },
    });

    // Update stock
    await StockService.recalculateStock(sale.date, undefined, sale.size_mm);

    return sale;
  },

  // Update sales entry
  async update(id: number, data: any) {
    const existing = await db.sales.findUnique({ where: { id } });
    if (!existing) throw new Error('Sales entry not found');

    const quantity = data.quantity ?? existing.quantity;
    const rate = data.rate ?? existing.rate;
    const amount = quantity * rate;

    const sale = await db.sales.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.customer_name !== undefined && {
          customer_name: data.customer_name,
        }),
        ...(data.size_mm !== undefined && { size_mm: data.size_mm }),
        ...(data.quantity !== undefined && { quantity }),
        ...(data.rate !== undefined && { rate }),
        amount,
        ...(data.remarks !== undefined && { remarks: data.remarks || null }),
      },
    });

    // Update stock for new date/size
    await StockService.recalculateStock(sale.date, undefined, sale.size_mm);

    // If date or size changed, update old record's stock
    if (existing.date.getTime() !== sale.date.getTime() || existing.size_mm !== sale.size_mm) {
      await StockService.recalculateStock(existing.date, undefined, existing.size_mm);
    }

    return sale;
  },

  // Delete sales entry
  async delete(id: number) {
    const existing = await db.sales.findUnique({ where: { id } });
    if (!existing) throw new Error('Sales entry not found');

    const sale = await db.sales.delete({ where: { id } });

    // Update stock
    await StockService.recalculateStock(sale.date, undefined, sale.size_mm);

    return sale;
  },

  // Get daily sales summary
  async getDailySummary(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await db.sales.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    return {
      date: date.toISOString().split('T')[0],
      totalQuantity: entries.reduce((sum, e) => sum + e.quantity, 0),
      totalAmount: entries.reduce((sum, e) => sum + e.amount, 0),
      entries,
    };
  },
};
