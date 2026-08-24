import { z } from "zod";

export const invoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .trim()
    .min(1, "Nomor invoice wajib diisi.")
    .max(100, "Nomor invoice maksimal 100 karakter."),

  type: z.enum(["SALE", "PURCHASE"], {
    message: "Tipe invoice tidak valid.",
  }),

  dueDate: z.coerce.date({ message: "Tanggal jatuh tempo wajib diisi." }),

  issueDate: z.coerce.date({ message: "Tanggal penerbitan wajib diisi." }),

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

export type InvoiceInput = z.input<typeof invoiceSchema>;

