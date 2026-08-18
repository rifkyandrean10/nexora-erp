"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

import {
  stockMovementSchema,
  type StockMovementInput,
} from "@/lib/validations/stock-movement";

/**
 * GET STOCK MOVEMENTS
 *
 * Mengambil seluruh riwayat perubahan stok
 * berdasarkan organisasi user yang sedang login.
 */
export async function getStockMovements() {
  await requirePermission(
    "STOCK_MOVEMENT",
    "VIEW"
  );

  const organizationId =
    await requireOrganizationId();

  return prisma.stockMovement.findMany({
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

    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * GET SINGLE STOCK MOVEMENT
 */
export async function getStockMovementById(
  id: string
) {
  await requirePermission(
    "STOCK_MOVEMENT",
    "VIEW"
  );

  const organizationId =
    await requireOrganizationId();

  const movement =
    await prisma.stockMovement.findFirst({
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

  if (!movement) {
    return {
      success: false,
      message:
        "Stock movement tidak ditemukan.",
    };
  }

  /**
   * Prisma Decimal tidak boleh dikirim
   * langsung ke Client Component.
   *
   * Konversi quantity menjadi number.
   */
  return {
    success: true,
    data: {
      ...movement,
      quantity: Number(
        movement.quantity
      ),
    },
  };
}

/**
 * CREATE STOCK MOVEMENT
 *
 * IN:
 *   Inventory bertambah.
 *
 * OUT:
 *   Inventory berkurang.
 *
 * ADJUSTMENT:
 *   Inventory disesuaikan dengan quantity
 *   yang diberikan.
 *
 * Semua perubahan inventory dan pencatatan
 * stock movement dilakukan dalam satu transaksi.
 */
export async function createStockMovement(
  input: StockMovementInput
) {
  await requirePermission(
    "STOCK_MOVEMENT",
    "CREATE"
  );

  const organizationId =
    await requireOrganizationId();

  const parsed =
    stockMovementSchema.safeParse(
      input
    );

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Data stock movement tidak valid.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  /**
   * Pastikan product milik organization.
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
      message:
        "Produk tidak ditemukan.",
    };
  }

  /**
   * Produk inactive tidak boleh
   * digunakan untuk movement baru.
   */
  if (product.status === "INACTIVE") {
    return {
      success: false,
      message:
        "Produk inactive tidak dapat digunakan.",
    };
  }

  /**
   * Pastikan warehouse milik organization.
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
      message:
        "Gudang tidak ditemukan.",
    };
  }

  /**
   * Warehouse inactive tidak boleh
   * digunakan untuk movement baru.
   */
  if (warehouse.status === "INACTIVE") {
    return {
      success: false,
      message:
        "Warehouse inactive tidak dapat digunakan.",
    };
  }

  /**
   * Semua perubahan inventory + movement
   * dilakukan dalam satu database transaction.
   */
  try {
    const movement =
      await prisma.$transaction(
        async (tx) => {
          const inventory =
            await tx.inventory.findUnique({
              where: {
                organizationId_productId_warehouseId:
                  {
                    organizationId,
                    productId:
                      data.productId,
                    warehouseId:
                      data.warehouseId,
                  },
              },
            });

          /**
           * Tentukan quantity baru.
           */
          let newQuantity: number;

          const currentQuantity =
            inventory
              ? Number(
                  inventory.quantity
                )
              : 0;

          if (data.type === "IN") {
            newQuantity =
              currentQuantity +
              data.quantity;
          } else if (
            data.type === "OUT"
          ) {
            newQuantity =
              currentQuantity -
              data.quantity;

            /**
             * Stock tidak boleh negatif.
             */
            if (newQuantity < 0) {
              throw new Error(
                `Stok tidak mencukupi. Stok saat ini: ${currentQuantity}.`
              );
            }
          } else {
            /**
             * ADJUSTMENT menggunakan quantity
             * sebagai nilai stok akhir.
             *
             * Contoh:
             * stok saat ini = 10
             * adjustment = 7
             * hasil akhir = 7
             */
            newQuantity =
              data.quantity;
          }

          /**
           * Buat atau update inventory.
           */
          if (inventory) {
            await tx.inventory.update({
              where: {
                id: inventory.id,
              },

              data: {
                quantity:
                  newQuantity,
              },
            });
          } else {
            /**
             * Inventory belum ada.
             *
             * OUT tidak diperbolehkan jika
             * inventory belum tersedia.
             */
            if (data.type === "OUT") {
              throw new Error(
                "Inventory belum tersedia untuk produk dan warehouse tersebut."
              );
            }

            await tx.inventory.create({
              data: {
                organizationId,
                productId:
                  data.productId,
                warehouseId:
                  data.warehouseId,
                quantity:
                  newQuantity,
              },
            });
          }

          /**
           * Catat riwayat movement.
           */
          return tx.stockMovement.create({
            data: {
              organizationId,
              productId:
                data.productId,
              warehouseId:
                data.warehouseId,
              type: data.type,
              quantity:
                data.quantity,
              reference:
                data.reference ||
                null,
              notes:
                data.notes ||
                null,
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
      );

    revalidatePath(
      "/dashboard/inventory"
    );

    revalidatePath(
      "/dashboard/stock-movements"
    );

    /**
     * Prisma Decimal tidak boleh dikirim
     * langsung ke Client Component.
     *
     * Konversi quantity menjadi number
     * sebelum return.
     */
    return {
      success: true,
      message:
        "Stock movement berhasil dibuat.",
      data: {
        ...movement,
        quantity: Number(
          movement.quantity
        ),
      },
    };
  } catch (error) {
    console.error(
      "CREATE_STOCK_MOVEMENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat stock movement.",
    };
  }
}