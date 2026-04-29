import db from '@/lib/db';

export const purchaseService = {
  // Get all purchase entries
  async getAllPurchase() {
    return db.purchase.findMany({
      include: {
        material: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  },

  // Get purchase entries by date
  async getPurchaseByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.purchase.findMany({
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

  // Get purchase entries by supplier
  async getPurchaseBySupplier(supplier: string) {
    return db.purchase.findMany({
      where: {
        supplier: {
          contains: supplier,
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

  // Get purchase entries by material
  async getPurchaseByMaterial(materialId: number) {
    return db.purchase.findMany({
      where: {
        materialId,
      },
      include: {
        material: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  },

  // Get purchase entries by invoice number
  async getPurchaseByInvoice(invoiceNo: string) {
    return db.purchase.findMany({
      where: {
        invoice_no: {
          contains: invoiceNo,
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

  // Get single purchase entry by ID
  async getPurchaseById(id: number) {
    return db.purchase.findUnique({
      where: { id },
      include: {
        material: true,
      },
    });
  },

  // Create new purchase entry
  async createPurchase(data: any) {
    // Verify material exists
    const material = await db.material.findUnique({
      where: { id: data.materialId },
    });

    if (!material) {
      throw new Error(`Material with ID ${data.materialId} not found`);
    }

    return db.purchase.create({
      data: {
        date: new Date(data.date),
        invoice_no: data.invoice_no,
        supplier: data.supplier,
        materialId: data.materialId,
        quantity_kg: data.quantity_kg,
        quantity_box: data.quantity_box || null,
        packing_ok: data.packing_ok ?? true,
        winding_uneven: data.winding_uneven ?? false,
        colour_shade_ok: data.colour_shade_ok ?? true,
        dnk_og_ok: data.dnk_og_ok ?? true,
        stain: data.stain ?? false,
        strength_ok: data.strength_ok ?? true,
        stretchability_ok: data.stretchability_ok ?? true,
        remarks: data.remarks || null,
      },
      include: {
        material: true,
      },
    });
  },

  // Update purchase entry
  async updatePurchase(id: number, data: any) {
    const existing = await db.purchase.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Purchase entry not found');
    }

    // Verify material exists if being changed
    if (data.materialId && data.materialId !== existing.materialId) {
      const material = await db.material.findUnique({
        where: { id: data.materialId },
      });
      if (!material) {
        throw new Error(`Material with ID ${data.materialId} not found`);
      }
    }

    return db.purchase.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.invoice_no !== undefined && { invoice_no: data.invoice_no }),
        ...(data.supplier !== undefined && { supplier: data.supplier }),
        ...(data.materialId !== undefined && { materialId: data.materialId }),
        ...(data.quantity_kg !== undefined && {
          quantity_kg: data.quantity_kg,
        }),
        ...(data.quantity_box !== undefined && {
          quantity_box: data.quantity_box,
        }),
        ...(data.packing_ok !== undefined && { packing_ok: data.packing_ok }),
        ...(data.winding_uneven !== undefined && {
          winding_uneven: data.winding_uneven,
        }),
        ...(data.colour_shade_ok !== undefined && {
          colour_shade_ok: data.colour_shade_ok,
        }),
        ...(data.dnk_og_ok !== undefined && { dnk_og_ok: data.dnk_og_ok }),
        ...(data.stain !== undefined && { stain: data.stain }),
        ...(data.strength_ok !== undefined && {
          strength_ok: data.strength_ok,
        }),
        ...(data.stretchability_ok !== undefined && {
          stretchability_ok: data.stretchability_ok,
        }),
        ...(data.remarks !== undefined && { remarks: data.remarks || null }),
      },
      include: {
        material: true,
      },
    });
  },

  // Delete purchase entry
  async deletePurchase(id: number) {
    return db.purchase.delete({
      where: { id },
    });
  },
};
