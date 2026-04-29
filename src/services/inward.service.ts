import db from '@/lib/db';

export const inwardService = {
  // Get all inward entries
  async getAllInward() {
    return db.inward.findMany({
      include: {
        material: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  },

  // Get inward entries by date
  async getInwardByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.inward.findMany({
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

  // Get inward entries by supplier
  async getInwardBySupplier(supplier: string) {
    return db.inward.findMany({
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

  // Get inward entries by material
  async getInwardByMaterial(materialId: number) {
    return db.inward.findMany({
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

  // Get inward entries by invoice number
  async getInwardByInvoice(invoiceNo: string) {
    return db.inward.findMany({
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

  // Get single inward entry by ID
  async getInwardById(id: number) {
    return db.inward.findUnique({
      where: { id },
      include: {
        material: true,
      },
    });
  },

  // Create new inward entry
  async createInward(data: any) {
    // Verify material exists
    const material = await db.material.findUnique({
      where: { id: data.materialId },
    });

    if (!material) {
      throw new Error(`Material with ID ${data.materialId} not found`);
    }

    return db.inward.create({
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

  // Update inward entry
  async updateInward(id: number, data: any) {
    const existing = await db.inward.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Inward entry not found');
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

    return db.inward.update({
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

  // Delete inward entry
  async deleteInward(id: number) {
    return db.inward.delete({
      where: { id },
    });
  },
};
