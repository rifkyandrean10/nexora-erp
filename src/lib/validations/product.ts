import { z } from "zod";

export const productSchema = z.object({
  categoryId: z
    .string()
    .uuid("Kategori tidak valid."),

  code: z
    .string()
    .trim()
    .min(2, "Kode produk minimal 2 karakter.")
    .max(50, "Kode produk maksimal 50 karakter."),

  name: z
    .string()
    .trim()
    .min(2, "Nama produk minimal 2 karakter.")
    .max(150, "Nama produk maksimal 150 karakter."),

  description: z
    .string()
    .trim()
    .max(
      1000,
      "Deskripsi maksimal 1000 karakter."
    )
    .optional(),

  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi.")
    .max(
      30,
      "Satuan maksimal 30 karakter."
    ),

  purchasePrice: z
    .number()
    .finite("Harga beli tidak valid.")
    .min(
      0,
      "Harga beli tidak boleh negatif."
    ),

  sellingPrice: z
    .number()
    .finite("Harga jual tidak valid.")
    .min(
      0,
      "Harga jual tidak boleh negatif."
    ),

  status: z.enum([
    "ACTIVE",
    "INACTIVE",
  ]),
});

export type ProductInput =
  z.infer<typeof productSchema>;