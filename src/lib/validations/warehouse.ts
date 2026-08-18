import { z } from "zod";

export const warehouseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Kode warehouse minimal 2 karakter.")
    .max(50, "Kode warehouse maksimal 50 karakter."),

  name: z
    .string()
    .trim()
    .min(2, "Nama warehouse minimal 2 karakter.")
    .max(100, "Nama warehouse maksimal 100 karakter."),

  description: z
    .string()
    .trim()
    .max(
      500,
      "Deskripsi maksimal 500 karakter."
    )
    .optional(),

  address: z
    .string()
    .trim()
    .max(
      255,
      "Alamat maksimal 255 karakter."
    )
    .optional(),

  city: z
    .string()
    .trim()
    .max(
      100,
      "Kota maksimal 100 karakter."
    )
    .optional(),

  country: z
    .string()
    .trim()
    .min(2, "Negara minimal 2 karakter.")
    .max(
      100,
      "Negara maksimal 100 karakter."
    ),

  status: z.enum([
    "ACTIVE",
    "INACTIVE",
  ]),
});

export type WarehouseInput =
  z.infer<typeof warehouseSchema>;