import { z } from "zod";

const saleItemSchema = z.object({
  productId: z
    .string()
    .uuid("Produk tidak valid."),

  quantity: z
    .number()
    .positive(
      "Quantity harus lebih besar dari 0."
    ),

  unitPrice: z
    .number()
    .nonnegative(
      "Harga tidak boleh negatif."
    ),
});

export const saleSchema = z
  .object({
    customerId: z
      .string()
      .uuid("Customer tidak valid."),

    warehouseId: z
      .string()
      .uuid("Warehouse tidak valid."),

    invoiceNumber: z
      .string()
      .trim()
      .max(
        100,
        "Nomor invoice maksimal 100 karakter."
      )
      .optional()
      .or(z.literal("")),

    notes: z
      .string()
      .trim()
      .max(
        1000,
        "Catatan maksimal 1000 karakter."
      )
      .optional()
      .or(z.literal("")),

    items: z
      .array(saleItemSchema)
      .min(
        1,
        "Minimal harus ada satu produk."
      ),
  })
  .superRefine((data, ctx) => {
    const productIds = new Set<string>();

    for (const item of data.items) {
      if (productIds.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items"],
          message:
            "Produk yang sama tidak boleh ditambahkan lebih dari satu kali.",
        });

        break;
      }

      productIds.add(item.productId);
    }
  });

export type SaleInput = z.infer<
  typeof saleSchema
>;

export type SaleItemInput = z.infer<
  typeof saleItemSchema
>;
