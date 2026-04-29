import db from '@/lib/db';

// Helper to format date as YYYY-MM-DD for consistent frontend comparison
function formatDateToString(date: Date | string): string {
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

// Helper to normalize inventory response to have date as string
function normalizeInventoryResponse(entries: any[]) {
  return entries.map(entry => ({
    ...entry,
    date: formatDateToString(entry.date),
  }));
}

export const inventoryService = {
  // Get all inventory ledger entries
  async getAllInventory() {
    const entries = await db.inventoryLedger.findMany({
      include: {
        material: true,
      },
      orderBy: [
        { date: 'desc' },
        { materialId: 'asc' },
      ],
    });
    return normalizeInventoryResponse(entries);
  },

  // Get inventory for a specific date
  async getInventoryByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await db.inventoryLedger.findMany({
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
        size_mm: 'asc',
      },
    });
    return normalizeInventoryResponse(entries);
  },

  // Get inventory for a specific size
  async getInventoryBySize(size_mm: number) {
    const entries = await db.inventoryLedger.findMany({
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
    return normalizeInventoryResponse(entries);
  },

  // Get single inventory entry by ID
  async getInventoryById(id: number) {
    const entry = await db.inventoryLedger.findUnique({
      where: { id },
      include: {
        material: true,
      },
    });
    return entry ? normalizeInventoryResponse([entry])[0] : null;
  },

  // Get previous day's balance for a material and size
  async getPreviousDayBalance(date: Date, materialId: number, size_mm: number) {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);

    const startOfDay = new Date(previousDay);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(previousDay);
    endOfDay.setHours(23, 59, 59, 999);

    const previousEntry = await db.inventoryLedger.findFirst({
      where: {
        size_mm,
        materialId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return previousEntry?.balance ?? 0;
  },

  // Create inventory entry
  async createInventory(data: any) {
    const material = await db.material.findUnique({
      where: { id: data.materialId },
    });

    if (!material) {
      throw new Error(`Material with ID ${data.materialId} not found`);
    }

    // Check if already exists for this date/material/size
    const existing = await db.inventoryLedger.findFirst({
      where: {
        date: new Date(data.date),
        materialId: data.materialId,
        size_mm: data.size_mm,
      },
    });

    if (existing) {
      throw new Error(
        `Inventory entry already exists for material ${material.name} / ${data.size_mm}mm on ${data.date}`
      );
    }

    const opening_stock = data.opening_stock ?? 0;
    const inward = data.inward ?? 0;
    const production = data.production ?? 0;
    const delivery = data.delivery ?? 0;

    // Calculate balance
    const balance = opening_stock + inward + production - delivery;

    const entry = await db.inventoryLedger.create({
      data: {
        date: new Date(data.date),
        materialId: data.materialId,
        size_mm: data.size_mm,
        opening_stock,
        inward,
        production,
        delivery,
        balance,
      },
      include: {
        material: true,
      },
    });
    return normalizeInventoryResponse([entry])[0];
  },

  // Update inventory entry and recalculate balance
  async updateInventory(id: number, data: any) {
    const existing = await db.inventoryLedger.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Inventory entry not found');
    }

    const opening_stock = data.opening_stock ?? existing.opening_stock;
    const inward = data.inward ?? existing.inward;
    const production = data.production ?? existing.production;
    const delivery = data.delivery ?? existing.delivery;

    // Recalculate balance
    const balance = opening_stock + inward + production - delivery;

    const entry = await db.inventoryLedger.update({
      where: { id },
      data: {
        opening_stock,
        inward,
        production,
        delivery,
        balance,
      },
      include: {
        material: true,
      },
    });
    return normalizeInventoryResponse([entry])[0];
  },

  // Update delivery amount and auto-calculate balance
  async updateDelivery(id: number, delivery: number) {
    const existing = await db.inventoryLedger.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Inventory entry not found');
    }

    const balance =
      existing.opening_stock + existing.inward + existing.production - delivery;

    const entry = await db.inventoryLedger.update({
      where: { id },
      data: {
        delivery,
        balance,
      },
      include: {
        material: true,
      },
    });
    return normalizeInventoryResponse([entry])[0];
  },

  // Delete inventory entry
  async deleteInventory(id: number) {
    return db.inventoryLedger.delete({
      where: { id },
    });
  },

  // Get inventory report for a date range
  async getInventoryReport(startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const data = await db.inventoryLedger.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        material: true,
      },
      orderBy: [
        { date: 'asc' },
        { size_mm: 'asc' },
      ],
    });

    return normalizeInventoryResponse(data);
  },

  // Get current stock (latest entry for each material+size)
  async getCurrentStock() {
    const materials = await db.material.findMany({
      orderBy: { name: 'asc' },
    });

    const currentStock = [];

    for (const material of materials) {
      const latest = await db.inventoryLedger.findFirst({
        where: { materialId: material.id },
        orderBy: { date: 'desc' },
        include: { material: true },
      });

      if (latest) {
        currentStock.push(latest);
      }
    }

    return normalizeInventoryResponse(currentStock);
  },
};
