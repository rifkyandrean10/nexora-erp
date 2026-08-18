"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

import {
  inventoryAdjustmentSchema,
  type InventoryAdjustmentInput,
} from "@/lib/validations/inventory";

/**
 * GET INVENTORY
 *
 * Mengambil seluruh inventory
 * berdasarkan organisasi user yang sedang login.
 */
export async function getInventory() {
  await requirePermission(
    "INVENTORY",
    "VIEW"
  );

  const organizationId =
    await requireOrganizationId();

  const inventories =
    await prisma.inventory.findMany({
      where: {
        organizationId,
      },

      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true,
            status: true,
          },
        },

        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
          },
        },
      },

      orderBy: [
        {
          warehouse: {
            name: "asc",
          },
        },
        {
          product: {
            name: "asc",
          },
        },
      ],
    });

  return inventories;
}

/**
 * GET SINGLE INVENTORY
 */
export async function getInventoryById(
  id: string
) {
  await requirePermission(
    "INVENTORY",
    "VIEW"
  );

  const organizationId =
    await requireOrganizationId();

  const inventory =
    await prisma.inventory.findFirst({
      where: {
        id,
        organizationId,
      },

      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true,
            status: true,
          },
        },

        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
          },
        },
      },
    });

  if (!inventory) {
    return {
      success: false,
      message: "Inventory tidak ditemukan.",
    };
  }

  return {
    success: true,
    data: inventory,
  };
}

/**
 * ADJUST INVENTORY
 *
 * Membuat inventory jika belum ada.
 *
 * Jika inventory sudah ada:
 * - quantity akan diganti dengan nilai baru
 * - quantity tidak boleh negatif
 *
 * Perubahan stok melalui transaksi
 * Stock Movement akan dibuat pada tahap berikutnya.
 */
export async function adjustInventory(
  input: InventoryAdjustmentInput
) {
  await requirePermission(
    "INVENTORY",
    "ADJUST"
  );

  const organizationId =
    await requireOrganizationId();

  const parsed =
    inventoryAdjustmentSchema.safeParse(
      input
    );

  if (!parsed.success) {
    return {
      success: false,
      message: "Data inventory tidak valid.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  /**
   * Pastikan product memang milik
   * organisasi user.
   */
  const product =
    await prisma.product.findFirst({
      where: {
        id: data.productId,
        organizationId,
      },

      select: {
        id: true,
        name: true,
        status: true,
      },
    });

  if (!product) {
    return {
      success: false,
      message: "Produk tidak ditemukan.",
    };
  }

  /**
   * Pastikan warehouse memang milik
   * organisasi user.
   */
  const warehouse =
    await prisma.warehouse.findFirst({
      where: {
        id: data.warehouseId,
        organizationId,
      },

      select: {
        id: true,
        name: true,
        status: true,
      },
    });

  if (!warehouse) {
    return {
      success: false,
      message: "Gudang tidak ditemukan.",
    };
  }

  /**
   * Produk inactive tidak boleh
   * digunakan untuk inventory baru.
   */
  if (product.status === "INACTIVE") {
    return {
      success: false,
      message:
        "Produk inactive tidak dapat digunakan.",
    };
  }

  /**
   * Warehouse inactive tidak boleh
   * digunakan untuk inventory baru.
   */
  if (warehouse.status === "INACTIVE") {
    return {
      success: false,
      message:
        "Gudang inactive tidak dapat digunakan.",
    };
  }

  /**
   * Cari inventory berdasarkan
   * kombinasi:
   *
   * organization + product + warehouse
   */
  const existingInventory =
    await prisma.inventory.findUnique({
      where: {
        organizationId_productId_warehouseId: {
          organizationId,
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },

      select: {
        id: true,
      },
    });

  let inventory;

  if (existingInventory) {
    /**
     * UPDATE QUANTITY
     */
    inventory =
      await prisma.inventory.update({
        where: {
          id: existingInventory.id,
        },

        data: {
          quantity: data.quantity,
        },

        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              unit: true,
              status: true,
            },
          },

          warehouse: {
            select: {
              id: true,
              code: true,
              name: true,
              status: true,
            },
          },
        },
      });
  } else {
    /**
     * CREATE INVENTORY
     */
    inventory =
      await prisma.inventory.create({
        data: {
          organizationId,
          productId: data.productId,
          warehouseId: data.warehouseId,
          quantity: data.quantity,
        },

        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              unit: true,
              status: true,
            },
          },

          warehouse: {
            select: {
              id: true,
              code: true,
              name: true,
              status: true,
            },
          },
        },
      });
  }

  revalidatePath(
    "/dashboard/inventory"
  );

  return {
    success: true,
    message:
      "Inventory berhasil diperbarui.",
    data: inventory,
  };
}