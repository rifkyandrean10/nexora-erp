import { z } from "zod";

export const invoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .trim()
    .min(1, "Nomor invoice wajib diisi.")
    .max(100, "Nomor invoice maksimal 100 karakter."),

  type: z.enum(["SALE", "PURCHASE"], {
    errorMap: () => ({ message: "Tipe invoice tidak valid." }),
  }),

  dueDate: z
    .string()
    .min(1, "Tanggal jatuh tempo wajib diisi.")
    .transform((val) => new Date(val)),

  issueDate: z
    .string()
    .min(1, "Tanggal penerbitan wajib diisi.")
    .transform((val) => new Date(val)),

  saleId: z
    .string()
    .uuid("Penjualan tidak valid.")
    .optional()
    .nullable()
    .or(z.literal("")),

  purchaseId: z
    .string()
    .uuid("Pembelian tidak valid.")
    .optional()
    .nullable()
    .or(z.literal("")),

  totalAmount: z
    .number()
    .positive("Total amount harus lebih besar dari 0."),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
