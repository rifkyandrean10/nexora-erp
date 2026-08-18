"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

import {
  warehouseSchema,
  type WarehouseInput,
} from "@/lib/validations/warehouse";

/**
 * CREATE WAREHOUSE
 */
export async function createWarehouse(
  input: WarehouseInput
) {
  await requirePermission(
    "WAREHOUSE",
    "CREATE"
  );

  const organizationId =
    await requireOrganizationId();

  const parsed =
    warehouseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Data warehouse tidak valid.",
      errors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  const data = parsed.data;

  const code = data.code
    .trim()
    .toUpperCase();

  const name = data.name.trim();

  const existingCode =
    await prisma.warehouse.findFirst({
      where: {
        organizationId,
        code,
      },
      select: {
        id: true,
      },
    });

  if (existingCode) {
    return {
      success: false,
      message:
        "Kode warehouse sudah digunakan.",
    };
  }

  const existingName =
    await prisma.warehouse.findFirst({
      where: {
        organizationId,
        name,
      },
      select: {
        id: true,
      },
    });

  if (existingName) {
    return {
      success: false,
      message:
        "Nama warehouse sudah digunakan.",
    };
  }

  const warehouse =
    await prisma.warehouse.create({
      data: {
        organizationId,
        code,
        name,
        description:
          data.description || null,
        address:
          data.address || null,
        city:
          data.city || null,
        country:
          data.country.trim(),
        status: data.status,
      },
    });

  revalidatePath(
    "/dashboard/warehouses"
  );

  return {
    success: true,
    message:
      "Warehouse berhasil dibuat.",
    data: warehouse,
  };
}

/**
 * UPDATE WAREHOUSE
 */
export async function updateWarehouse(
  id: string,
  input: WarehouseInput
) {
  await requirePermission(
    "WAREHOUSE",
    "UPDATE"
  );

  const organizationId =
    await requireOrganizationId();

  const parsed =
    warehouseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Data warehouse tidak valid.",
      errors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  const data = parsed.data;

  const warehouse =
    await prisma.warehouse.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
      },
    });

  if (!warehouse) {
    return {
      success: false,
      message:
        "Warehouse tidak ditemukan.",
    };
  }

  const code = data.code
    .trim()
    .toUpperCase();

  const name = data.name.trim();

  const duplicateCode =
    await prisma.warehouse.findFirst({
      where: {
        organizationId,
        code,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

  if (duplicateCode) {
    return {
      success: false,
      message:
        "Kode warehouse sudah digunakan.",
    };
  }

  const duplicateName =
    await prisma.warehouse.findFirst({
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

  if (duplicateName) {
    return {
      success: false,
      message:
        "Nama warehouse sudah digunakan.",
    };
  }

  const updatedWarehouse =
    await prisma.warehouse.update({
      where: {
        id: warehouse.id,
      },
      data: {
        code,
        name,
        description:
          data.description || null,
        address:
          data.address || null,
        city:
          data.city || null,
        country:
          data.country.trim(),
        status: data.status,
      },
    });

  revalidatePath(
    "/dashboard/warehouses"
  );

  return {
    success: true,
    message:
      "Warehouse berhasil diperbarui.",
    data: updatedWarehouse,
  };
}

/**
 * DELETE WAREHOUSE
 */
export async function deleteWarehouse(
  id: string
) {
  await requirePermission(
    "WAREHOUSE",
    "DELETE"
  );

  const organizationId =
    await requireOrganizationId();

  const warehouse =
    await prisma.warehouse.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
      },
    });

  if (!warehouse) {
    return {
      success: false,
      message:
        "Warehouse tidak ditemukan.",
    };
  }

  await prisma.warehouse.delete({
    where: {
      id: warehouse.id,
    },
  });

  revalidatePath(
    "/dashboard/warehouses"
  );

  return {
    success: true,
    message:
      "Warehouse berhasil dihapus.",
  };
}

/**
 * GET WAREHOUSES
 */
export async function getWarehouses() {
  await requirePermission(
    "WAREHOUSE",
    "VIEW"
  );

  const organizationId =
    await requireOrganizationId();

  return prisma.warehouse.findMany({
    where: {
      organizationId,
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
}