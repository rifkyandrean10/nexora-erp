import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
  productId: z
    .string()
    .uuid("Produk tidak valid."),

  warehouseId: z
    .string()
    .uuid("Gudang tidak valid."),

  quantity: z
    .number()
    .finite("Jumlah stok harus berupa angka.")
    .min(0, "Jumlah stok tidak boleh negatif."),
});

export type InventoryAdjustmentInput = z.infer<
  typeof inventoryAdjustmentSchema
>;