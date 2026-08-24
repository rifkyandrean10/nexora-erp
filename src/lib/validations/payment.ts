import { z } from "zod";

export const paymentSchema = z.object({
  invoiceId: z
    .string()
    .uuid("Invoice tidak valid."),

  paymentNumber: z
    .string()
    .trim()
    .min(1, "Nomor pembayaran wajib diisi.")
    .max(100, "Nomor pembayaran maksimal 100 karakter."),

  paymentDate: z.coerce.date({ message: "Tanggal pembayaran wajib diisi." }),

  amount: z
    .number()
    .positive("Jumlah pembayaran harus lebih besar dari 0."),

  method: z.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD", "OTHER"], {
    message: "Metode pembayaran tidak valid.",
  }),

  reference: z
    .string()
    .trim()
    .max(100, "Referensi maksimal 100 karakter.")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(1000, "Catatan maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
});

export type PaymentInput = z.input<typeof paymentSchema>;

