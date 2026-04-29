import { z } from 'zod';

// Product Validation
export const createProductSchema = z.object({
  size_mm: z.number().positive('Size must be positive'),
  meter_weight: z.number().positive('Meter weight must be positive'),
  tape_count: z.number().int().positive('Tape count must be positive'),
  base_rate: z.number().nonnegative('Base rate cannot be negative'),
  fixed_cost: z.number().nonnegative('Fixed cost cannot be negative'),
  net_rate: z.number().nonnegative('Net rate cannot be negative'),
  customer_rate: z.number().nonnegative('Customer rate cannot be negative'),
});

export const updateProductSchema = createProductSchema.partial();

// Production Validation
export const createProductionSchema = z.object({
  date: z.coerce.date(),
  operator_name: z.string().min(1, 'Operator name required'),
  material: z.string().min(1, 'Material required'),
  size_mm: z.number().positive('Size must be positive'),
  tapes: z.number().int().positive('Tapes must be positive'),
  meters_per_tape: z.number().positive('Meters per tape must be positive'),
  needle_break: z.number().int().nonnegative('Needle break must be non-negative').optional().default(0),
  remark: z.string().optional(),
});

// Inward Validation
export const createInwardSchema = z.object({
  date: z.coerce.date(),
  invoice_no: z.string().min(1, 'Invoice number required'),
  supplier: z.string().min(1, 'Supplier name required'),
  material: z.string().min(1, 'Material required'),
  quantity_kg: z.number().positive('Quantity must be positive'),
  quantity_box: z.number().nonnegative('Quantity in box must be non-negative').optional(),
  packing_ok: z.boolean().default(true),
  winding_uneven: z.boolean().default(false),
  colour_shade_ok: z.boolean().default(true),
  dnk_og_ok: z.boolean().default(true),
  stain: z.boolean().default(false),
  strength_ok: z.boolean().default(true),
  stretchability_ok: z.boolean().default(true),
  remarks: z.string().optional(),
});

// Inventory Ledger Validation
export const createInventoryLedgerSchema = z.object({
  date: z.coerce.date(),
  size_mm: z.number().positive('Size must be positive'),
  opening_stock: z.number().nonnegative('Opening stock cannot be negative').optional().default(0),
  inward: z.number().nonnegative('Inward cannot be negative').optional().default(0),
  production: z.number().nonnegative('Production cannot be negative').optional().default(0),
  delivery: z.number().nonnegative('Delivery cannot be negative').optional().default(0),
});

export const updateInventoryLedgerSchema = z.object({
  opening_stock: z.number().nonnegative().optional(),
  inward: z.number().nonnegative().optional(),
  production: z.number().nonnegative().optional(),
  delivery: z.number().nonnegative().optional(),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductionInput = z.infer<typeof createProductionSchema>;
export type CreateInwardInput = z.infer<typeof createInwardSchema>;
export type CreateInventoryLedgerInput = z.infer<typeof createInventoryLedgerSchema>;
export type UpdateInventoryLedgerInput = z.infer<typeof updateInventoryLedgerSchema>;
