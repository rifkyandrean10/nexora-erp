"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

import {
  categorySchema,
  type CategoryInput,
} from "@/lib/validations/category";

/**
 * CREATE CATEGORY
 */
export async function createCategory(input: CategoryInput) {
  await requirePermission("CATEGORY", "CREATE");

  const organizationId = await requireOrganizationId();

  const parsed = categorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data kategori tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const name = data.name.trim();

  const existingCategory = await prisma.category.findFirst({
    where: {
      organizationId,
      name,
    },
    select: {
      id: true,
    },
  });

  if (existingCategory) {
    return {
      success: false,
      message: "Nama kategori sudah digunakan.",
    };
  }

  const category = await prisma.category.create({
    data: {
      organizationId,
      name,
      description: data.description?.trim() || null,
      status: data.status,
    },
  });

  revalidatePath("/dashboard/categories");

  return {
    success: true,
    message: "Kategori berhasil dibuat.",
    data: category,
  };
}

/**
 * UPDATE CATEGORY
 */
export async function updateCategory(
  id: string,
  input: CategoryInput
) {
  await requirePermission("CATEGORY", "UPDATE");

  const organizationId = await requireOrganizationId();

  const parsed = categorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data kategori tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const name = data.name.trim();

  const category = await prisma.category.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return {
      success: false,
      message: "Kategori tidak ditemukan.",
    };
  }

  const duplicate = await prisma.category.findFirst({
    where: {
      organizationId,
      name,
      NOT: {
        id,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicate) {
    return {
      success: false,
      message: "Nama kategori sudah digunakan.",
    };
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: category.id,
    },
    data: {
      name,
      description: data.description?.trim() || null,
      status: data.status,
    },
  });

  revalidatePath("/dashboard/categories");

  return {
    success: true,
    message: "Kategori berhasil diperbarui.",
    data: updatedCategory,
  };
}

/**
 * DELETE CATEGORY
 */
export async function deleteCategory(id: string) {
  await requirePermission("CATEGORY", "DELETE");

  const organizationId = await requireOrganizationId();

  const category = await prisma.category.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return {
      success: false,
      message: "Kategori tidak ditemukan.",
    };
  }

  await prisma.category.delete({
    where: {
      id: category.id,
    },
  });

  revalidatePath("/dashboard/categories");

  return {
    success: true,
    message: "Kategori berhasil dihapus.",
  };
}

/**
 * GET CATEGORIES
 */
export async function getCategories() {
  await requirePermission("CATEGORY", "VIEW");

  const organizationId = await requireOrganizationId();

  return prisma.category.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      name: "asc",
    },
  });
}