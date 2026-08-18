import { z } from "zod";

const purchaseItemSchema = z.object({
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

export const purchaseSchema = z
  .object({
    supplierId: z
      .string()
      .uuid("Supplier tidak valid."),

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
      .array(purchaseItemSchema)
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

export type PurchaseInput = z.infer<
  typeof purchaseSchema
>;

export type PurchaseItemInput = z.infer<
  typeof purchaseItemSchema
>;