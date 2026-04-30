import { z } from 'zod';

// Purchase (Inward) Validation
export const createInwardSchema = z.object({
  date: z.coerce.date(),
  invoice_no: z.string().min(1, 'Invoice number required'),
  supplier: z.string().min(1, 'Supplier name required'),
  materialId: z.number().int().positive().optional().nullable(),
  size_mm: z.number().int().positive().optional().nullable(),
  quantity_kg: z.number().positive('Quantity must be positive'),
  quantity_box: z.number().nonnegative('Quantity in box must be non-negative').optional().nullable(),
  packing_ok: z.boolean().default(true).optional(),
  winding_uneven: z.boolean().default(false).optional(),
  colour_shade_ok: z.boolean().default(true).optional(),
  dnk_og_ok: z.boolean().default(true).optional(),
  stain: z.boolean().default(false).optional(),
  strength_ok: z.boolean().default(true).optional(),
  stretchability_ok: z.boolean().default(true).optional(),
  remarks: z.string().optional().nullable(),
}).refine(data => data.materialId || data.size_mm, {
  message: "Either Material or Size must be selected",
  path: ["materialId"]
});

// Sales Validation
export const createSalesSchema = z.object({
  date: z.coerce.date(),
  customer_name: z.string().min(1, 'Customer name required'),
  size_mm: z.number().int().positive('Size must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().positive('Rate must be positive'),
  remarks: z.string().optional().nullable(),
});
