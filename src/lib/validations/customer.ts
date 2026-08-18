import { z } from "zod";

export const customerSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Kode customer wajib diisi")
    .max(50, "Kode customer maksimal 50 karakter"),

  name: z
    .string()
    .trim()
    .min(1, "Nama customer wajib diisi")
    .max(150, "Nama customer maksimal 150 karakter"),

  email: z
    .string()
    .trim()
    .email("Format email tidak valid")
    .max(150, "Email maksimal 150 karakter")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(30, "Nomor telepon maksimal 30 karakter")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(255, "Alamat maksimal 255 karakter")
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .trim()
    .max(100, "Kota maksimal 100 karakter")
    .optional()
    .or(z.literal("")),

  country: z
    .string()
    .trim()
    .max(100, "Negara maksimal 100 karakter")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(1000, "Catatan maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),

  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CustomerInput = z.infer<typeof customerSchema>;