import { z } from "zod";

const userFields = {
  name: z
    .string()
    .trim()
    .min(1, "Nama user wajib diisi")
    .max(150, "Nama user maksimal 150 karakter"),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid")
    .max(150, "Email maksimal 150 karakter"),
  phone: z
    .string()
    .trim()
    .max(30, "Nomor telepon maksimal 30 karakter")
    .optional()
    .or(z.literal("")),
  roleId: z.string().trim().min(1, "Role wajib dipilih"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
};

export const createUserSchema = z.object({
  ...userFields,
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter"),
});

export const updateUserSchema = z.object({
  ...userFields,
  password: z
    .string()
    .max(128, "Password maksimal 128 karakter")
    .optional()
    .or(z.literal(""))
    .refine(
      (password) => !password || password.length >= 8,
      "Password minimal 8 karakter"
    ),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
