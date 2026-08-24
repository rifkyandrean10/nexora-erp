import { z } from "zod";

export const expenseSchema = z.object({
  expenseNumber: z
    .string()
    .trim()
    .min(1, "Nomor pengeluaran wajib diisi.")
    .max(100, "Nomor pengeluaran maksimal 100 karakter."),

  date: z.coerce.date({ message: "Tanggal wajib diisi." }),

  category: z
    .string()
    .trim()
    .min(1, "Kategori wajib diisi.")
    .max(100, "Kategori maksimal 100 karakter."),

  amount: z
    .number()
    .positive("Jumlah pengeluaran harus lebih besar dari 0."),

  notes: z
    .string()
    .trim()
    .max(1000, "Catatan maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
});

export const revenueSchema = z.object({
  revenueNumber: z
    .string()
    .trim()
    .min(1, "Nomor pendapatan wajib diisi.")
    .max(100, "Nomor pendapatan maksimal 100 karakter."),

  date: z.coerce.date({ message: "Tanggal wajib diisi." }),

  category: z
    .string()
    .trim()
    .min(1, "Kategori wajib diisi.")
    .max(100, "Kategori maksimal 100 karakter."),

  amount: z
    .number()
    .positive("Jumlah pendapatan harus lebih besar dari 0."),

  notes: z
    .string()
    .trim()
    .max(1000, "Catatan maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
});

export const cashFlowSchema = z.object({
  entryNumber: z
    .string()
    .trim()
    .min(1, "Nomor entri wajib diisi.")
    .max(100, "Nomor entri maksimal 100 karakter."),

  date: z.coerce.date({ message: "Tanggal wajib diisi." }),

  type: z.enum(["INFLOW", "OUTFLOW"], {
    message: "Tipe arus kas tidak valid.",
  }),

  amount: z
    .number()
    .positive("Jumlah harus lebih besar dari 0."),

  category: z
    .string()
    .trim()
    .min(1, "Kategori wajib diisi.")
    .max(100, "Kategori maksimal 100 karakter."),

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

export type ExpenseInput = z.input<typeof expenseSchema>;
export type RevenueInput = z.input<typeof revenueSchema>;
export type CashFlowInput = z.input<typeof cashFlowSchema>;

