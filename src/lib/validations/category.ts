import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter.")
    .max(100, "Nama kategori maksimal 100 karakter."),

  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter.")
    .optional(),

  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CategoryInput = z.infer<typeof categorySchema>;