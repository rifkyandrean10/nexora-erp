import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama role wajib diisi")
    .max(100, "Nama role maksimal 100 karakter"),

  description: z
    .string()
    .trim()
    .max(255, "Deskripsi maksimal 255 karakter")
    .optional()
    .or(z.literal("")),
});

export const updateRoleSchema = createRoleSchema;

export type CreateRoleInput =
  z.infer<typeof createRoleSchema>;

export type UpdateRoleInput =
  z.infer<typeof updateRoleSchema>;