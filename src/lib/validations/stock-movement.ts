import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z
    .string()
    .min(1, "Produk wajib dipilih."),

  warehouseId: z
    .string()
    .min(1, "Gudang wajib dipilih."),

  type: z.enum([
    "IN",
    "OUT",
    "ADJUSTMENT",
  ]),

  quantity: z
    .number()
    .positive(
      "Quantity harus lebih besar dari 0."
    ),

  reference: z
    .string()
    .trim()
    .max(
      100,
      "Reference maksimal 100 karakter."
    )
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(
      500,
      "Catatan maksimal 500 karakter."
    )
    .optional()
    .or(z.literal("")),
});

export type StockMovementInput =
  z.infer<typeof stockMovementSchema>;