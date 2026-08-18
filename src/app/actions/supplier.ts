"use server";

import { prisma } from "@/lib/prisma";

import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

import {
  supplierSchema,
  type SupplierInput,
} from "@/lib/validations/supplier";

/**
 * CREATE SUPPLIER
 */
export async function createSupplier(input: SupplierInput) {
  await requirePermission("SUPPLIER", "CREATE");

  const organizationId = await requireOrganizationId();

  const parsed = supplierSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data supplier tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existingSupplier = await prisma.supplier.findFirst({
    where: {
      organizationId,
      code: data.code,
    },
    select: {
      id: true,
    },
  });

  if (existingSupplier) {
    return {
      success: false,
      message: "Kode supplier sudah digunakan.",
    };
  }

  const supplier = await prisma.supplier.create({
    data: {
      organizationId,
      code: data.code,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || "Indonesia",
      notes: data.notes || null,
      status: data.status,
    },
  });

  return {
    success: true,
    message: "Supplier berhasil dibuat.",
    data: supplier,
  };
}

/**
 * UPDATE SUPPLIER
 */
export async function updateSupplier(
  id: string,
  input: SupplierInput
) {
  await requirePermission("SUPPLIER", "UPDATE");

  const organizationId = await requireOrganizationId();

  const parsed = supplierSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data supplier tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const supplier = await prisma.supplier.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!supplier) {
    return {
      success: false,
      message: "Supplier tidak ditemukan.",
    };
  }

  const duplicate = await prisma.supplier.findFirst({
    where: {
      organizationId,
      code: data.code,
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
      message: "Kode supplier sudah digunakan.",
    };
  }

  const updatedSupplier = await prisma.supplier.update({
    where: {
      id,
    },
    data: {
      code: data.code,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || "Indonesia",
      notes: data.notes || null,
      status: data.status,
    },
  });

  return {
    success: true,
    message: "Supplier berhasil diperbarui.",
    data: updatedSupplier,
  };
}

/**
 * DELETE SUPPLIER
 */
export async function deleteSupplier(id: string) {
  await requirePermission("SUPPLIER", "DELETE");

  const organizationId = await requireOrganizationId();

  const supplier = await prisma.supplier.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!supplier) {
    return {
      success: false,
      message: "Supplier tidak ditemukan.",
    };
  }

  await prisma.supplier.delete({
    where: {
      id: supplier.id,
    },
  });

  return {
    success: true,
    message: "Supplier berhasil dihapus.",
  };
}

/**
 * GET SUPPLIERS
 */
export async function getSuppliers() {
  await requirePermission("SUPPLIER", "VIEW");

  const organizationId = await requireOrganizationId();

  const suppliers = await prisma.supplier.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return suppliers;
}