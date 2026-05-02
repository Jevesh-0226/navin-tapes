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
  amount: z.number().nonnegative().optional().nullable(),
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
  size_mm: z.number().int().nonnegative('Size must be valid (0 for Unsize)'),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().nonnegative('Rate must be valid'),
  colour: z.string().optional().nullable(),
  product_type: z.string().optional().nullable(),
  quantity_box: z.number().nonnegative().optional().nullable(),
  po_number: z.string().min(1, 'PO Number is required'),
  dc_number: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

// Order Validation
export const createOrderSchema = z.object({
  po_number: z.string().min(1, 'PO Number is required'),
  customer_name: z.string().min(1, 'Customer name required'),
  size_mm: z.string().min(1, 'Size is required'),
  colour: z.string().min(1, 'Colour is required'),
  product_type: z.string().min(1, 'Product Type is required'),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().nonnegative('Rate must be valid'),
});

