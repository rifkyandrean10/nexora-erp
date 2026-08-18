"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

import {
  purchaseSchema,
  type PurchaseInput,
} from "@/lib/validations/purchase";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

/**
 * ============================================================
 * SERIALIZATION
 * ============================================================
 *
 * Prisma Decimal dan Date tidak boleh langsung dikirim
 * dari Server Component / Server Action ke Client Component.
 *
 * Karena itu seluruh hasil Prisma purchase dikonversi
 * menjadi primitive value.
 */

function serializePurchase<
  T extends {
    totalAmount: unknown;
    createdAt: Date;
    updatedAt: Date;
    items?: Array<{
      quantity: unknown;
      unitPrice: unknown;
      subtotal: unknown;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  },
>(purchase: T) {
  return {
    ...purchase,

    totalAmount: Number(purchase.totalAmount),

    createdAt: purchase.createdAt.toISOString(),

    updatedAt: purchase.updatedAt.toISOString(),

    items: purchase.items?.map((item) => ({
      ...item,

      quantity: Number(item.quantity),

      unitPrice: Number(item.unitPrice),

      subtotal: Number(item.subtotal),
    })),
  };
}

/**
 * ============================================================
 * PURCHASE INCLUDE
 * ============================================================
 *
 * Dipakai agar struktur data getPurchases,
 * getPurchaseById, createPurchase, dan updatePurchase
 * konsisten.
 */

const purchaseInclude = {
  supplier: {
    select: {
      id: true,
      code: true,
      name: true,
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

  items: {
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
    },
  },
} as const;

/**
 * ============================================================
 * GET PURCHASES
 * ============================================================
 */

export async function getPurchases() {
  await requirePermission("PURCHASE", "VIEW");

  const organizationId =
    await requireOrganizationId();

  const purchases =
    await prisma.purchase.findMany({
      where: {
        organizationId,
      },

      include: purchaseInclude,

      orderBy: {
        createdAt: "desc",
      },
    });

  return purchases.map(
    serializePurchase
  );
}

/**
 * ============================================================
 * GET SINGLE PURCHASE
 * ============================================================
 */

export async function getPurchaseById(
  id: string
) {
  await requirePermission("PURCHASE", "VIEW");

  const organizationId =
    await requireOrganizationId();

  const purchase =
    await prisma.purchase.findFirst({
      where: {
        id,
        organizationId,
      },

      include: purchaseInclude,
    });

  if (!purchase) {
    return {
      success: false,
      message: "Purchase tidak ditemukan.",
    };
  }

  return {
    success: true,

    data: serializePurchase(purchase),
  };
}

/**
 * ============================================================
 * CREATE PURCHASE
 * ============================================================
 */

export async function createPurchase(
  input: PurchaseInput
) {
  await requirePermission(
    "PURCHASE",
    "CREATE"
  );

  const organizationId =
    await requireOrganizationId();

  /**
   * Validate input
   */
  const parsed =
    purchaseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Data purchase tidak valid.",

      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  /**
   * Pastikan purchase memiliki item.
   */
  if (data.items.length === 0) {
    return {
      success: false,
      message:
        "Purchase harus memiliki minimal satu item.",
    };
  }

  /**
   * ========================================================
   * VALIDATE DUPLICATE PRODUCTS
   * ========================================================
   *
   * PurchaseItem memiliki:
   *
   * @@unique([purchaseId, productId])
   *
   * Jadi satu product tidak boleh muncul dua kali
   * dalam purchase yang sama.
   */

  const productIds = data.items.map(
    (item) => item.productId
  );

  const uniqueProductIds =
    new Set(productIds);

  if (
    uniqueProductIds.size !==
    productIds.length
  ) {
    return {
      success: false,
      message:
        "Produk yang sama tidak boleh ditambahkan lebih dari satu kali dalam purchase.",
    };
  }

  /**
   * ========================================================
   * VALIDATE SUPPLIER
   * ========================================================
   */

  const supplier =
    await prisma.supplier.findFirst({
      where: {
        id: data.supplierId,
        organizationId,
      },

      select: {
        id: true,
        name: true,
        status: true,
      },
    });

  if (!supplier) {
    return {
      success: false,
      message:
        "Supplier tidak ditemukan.",
    };
  }

  if (supplier.status === "INACTIVE") {
    return {
      success: false,
      message:
        "Supplier inactive tidak dapat digunakan.",
    };
  }

  /**
   * ========================================================
   * VALIDATE WAREHOUSE
   * ========================================================
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
        "Warehouse tidak ditemukan.",
    };
  }

  if (warehouse.status === "INACTIVE") {
    return {
      success: false,
      message:
        "Warehouse inactive tidak dapat digunakan.",
    };
  }

  /**
   * ========================================================
   * VALIDATE PRODUCTS
   * ========================================================
   */

  const products =
    await prisma.product.findMany({
      where: {
        organizationId,

        id: {
          in: productIds,
        },
      },

      select: {
        id: true,
        code: true,
        name: true,
        status: true,
      },
    });

  /**
   * Pastikan semua product ditemukan.
   */
  if (
    products.length !==
    productIds.length
  ) {
    return {
      success: false,
      message:
        "Salah satu produk tidak ditemukan.",
    };
  }

  /**
   * Pastikan product masih ACTIVE.
   */
  const inactiveProduct =
    products.find(
      (product) =>
        product.status === "INACTIVE"
    );

  if (inactiveProduct) {
    return {
      success: false,
      message:
        `Produk "${inactiveProduct.name}" inactive dan tidak dapat digunakan.`,
    };
  }

  /**
   * ========================================================
   * CALCULATE ITEMS
   * ========================================================
   */

  const items = data.items.map(
    (item) => {
      const subtotal =
        item.quantity *
        item.unitPrice;

      return {
        productId:
          item.productId,

        quantity:
          item.quantity,

        unitPrice:
          item.unitPrice,

        subtotal,
      };
    }
  );

  /**
   * Calculate total.
   */
  const totalAmount =
    items.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );

  /**
   * ========================================================
   * CREATE PURCHASE
   * ========================================================
   */

  const purchase =
    await prisma.$transaction(
      async (tx) => {
        return tx.purchase.create({
          data: {
            organizationId,

            supplierId:
              data.supplierId,

            warehouseId:
              data.warehouseId,

            invoiceNumber:
              data.invoiceNumber?.trim() ||
              null,

            notes:
              data.notes?.trim() ||
              null,

            status: "DRAFT",

            totalAmount,

            items: {
              create: items,
            },
          },

          include: purchaseInclude,
        });
      }
    );

  /**
   * Refresh purchasing page.
   */
  revalidatePath(
    "/dashboard/purchasing"
  );

  return {
    success: true,

    message:
      "Purchase berhasil dibuat.",

    data: serializePurchase(
      purchase
    ),
  };
}

/**
 * ============================================================
 * UPDATE PURCHASE
 * ============================================================
 *
 * Hanya purchase DRAFT yang dapat diedit.
 */

export async function updatePurchase(
  id: string,
  input: PurchaseInput
) {
  await requirePermission(
    "PURCHASE",
    "UPDATE"
  );

  const organizationId =
    await requireOrganizationId();

  /**
   * Validate input.
   */
  const parsed =
    purchaseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Data purchase tidak valid.",

      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  /**
   * Purchase harus memiliki item.
   */
  if (data.items.length === 0) {
    return {
      success: false,
      message:
        "Purchase harus memiliki minimal satu item.",
    };
  }

  /**
   * Check duplicate products.
   */
  const productIds = data.items.map(
    (item) => item.productId
  );

  const uniqueProductIds =
    new Set(productIds);

  if (
    uniqueProductIds.size !==
    productIds.length
  ) {
    return {
      success: false,
      message:
        "Produk yang sama tidak boleh ditambahkan lebih dari satu kali dalam purchase.",
    };
  }

  /**
   * ========================================================
   * FIND EXISTING PURCHASE
   * ========================================================
   */

  const existingPurchase =
    await prisma.purchase.findFirst({
      where: {
        id,
        organizationId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!existingPurchase) {
    return {
      success: false,
      message:
        "Purchase tidak ditemukan.",
    };
  }

  /**
   * Hanya DRAFT yang boleh diedit.
   */
  if (
    existingPurchase.status !==
    "DRAFT"
  ) {
    return {
      success: false,
      message:
        "Purchase yang sudah dikonfirmasi atau diterima tidak dapat diedit.",
    };
  }

  /**
   * ========================================================
   * VALIDATE SUPPLIER
   * ========================================================
   */

  const supplier =
    await prisma.supplier.findFirst({
      where: {
        id: data.supplierId,
        organizationId,
      },

      select: {
        id: true,
        name: true,
        status: true,
      },
    });

  if (!supplier) {
    return {
      success: false,
      message:
        "Supplier tidak ditemukan.",
    };
  }

  if (supplier.status === "INACTIVE") {
    return {
      success: false,
      message:
        "Supplier inactive tidak dapat digunakan.",
    };
  }

  /**
   * ========================================================
   * VALIDATE WAREHOUSE
   * ========================================================
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
        "Warehouse tidak ditemukan.",
    };
  }

  if (warehouse.status === "INACTIVE") {
    return {
      success: false,
      message:
        "Warehouse inactive tidak dapat digunakan.",
    };
  }

  /**
   * ========================================================
   * VALIDATE PRODUCTS
   * ========================================================
   */

  const products =
    await prisma.product.findMany({
      where: {
        organizationId,

        id: {
          in: productIds,
        },
      },

      select: {
        id: true,
        name: true,
        status: true,
      },
    });

  if (
    products.length !==
    productIds.length
  ) {
    return {
      success: false,
      message:
        "Salah satu produk tidak ditemukan.",
    };
  }

  const inactiveProduct =
    products.find(
      (product) =>
        product.status === "INACTIVE"
    );

  if (inactiveProduct) {
    return {
      success: false,
      message:
        `Produk "${inactiveProduct.name}" inactive dan tidak dapat digunakan.`,
    };
  }

  /**
   * ========================================================
   * CALCULATE ITEMS
   * ========================================================
   */

  const items = data.items.map(
    (item) => ({
      productId:
        item.productId,

      quantity:
        item.quantity,

      unitPrice:
        item.unitPrice,

      subtotal:
        item.quantity *
        item.unitPrice,
    })
  );

  const totalAmount =
    items.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );

  /**
   * ========================================================
   * UPDATE PURCHASE
   * ========================================================
   *
   * Existing PurchaseItem dihapus kemudian dibuat ulang.
   *
   * Karena PurchaseItem memiliki relation:
   *
   * purchase
   * product
   *
   * tidak ada lagi organizationId/supplierId/warehouseId
   * di PurchaseItem.
   */

  const updatedPurchase =
    await prisma.$transaction(
      async (tx) => {
        /**
         * Delete existing items.
         */
        await tx.purchaseItem.deleteMany({
          where: {
            purchaseId: id,
          },
        });

        /**
         * Update purchase.
         */
        return tx.purchase.update({
          where: {
            id,
          },

          data: {
            supplierId:
              data.supplierId,

            warehouseId:
              data.warehouseId,

            invoiceNumber:
              data.invoiceNumber?.trim() ||
              null,

            notes:
              data.notes?.trim() ||
              null,

            totalAmount,

            items: {
              create: items,
            },
          },

          include: purchaseInclude,
        });
      }
    );

  /**
   * Refresh purchasing page.
   */
  revalidatePath(
    "/dashboard/purchasing"
  );

  return {
    success: true,

    message:
      "Purchase berhasil diperbarui.",

    data: serializePurchase(
      updatedPurchase
    ),
  };
}

/**
 * ============================================================
 * CONFIRM PURCHASE
 * ============================================================
 *
 * DRAFT → CONFIRMED
 *
 * Confirm belum mengubah inventory.
 */

export async function confirmPurchase(
  id: string
) {
  await requirePermission(
    "PURCHASE",
    "UPDATE"
  );

  const organizationId =
    await requireOrganizationId();

  /**
   * Cari purchase berdasarkan organization.
   */
  const purchase =
    await prisma.purchase.findFirst({
      where: {
        id,
        organizationId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!purchase) {
    return {
      success: false,
      message:
        "Purchase tidak ditemukan.",
    };
  }

  /**
   * Hanya DRAFT yang dapat dikonfirmasi.
   */
  if (purchase.status !== "DRAFT") {
    return {
      success: false,
      message:
        "Hanya purchase DRAFT yang dapat dikonfirmasi.",
    };
  }

  /**
   * Update dengan kondisi DRAFT.
   *
   * Ini juga membantu mencegah dua request
   * concurrent mengubah purchase yang sama.
   */
  const result =
    await prisma.purchase.updateMany({
      where: {
        id: purchase.id,
        organizationId,
        status: "DRAFT",
      },

      data: {
        status: "CONFIRMED",
      },
    });

  if (result.count === 0) {
    return {
      success: false,
      message:
        "Purchase sudah berubah status dan tidak dapat dikonfirmasi.",
    };
  }

  /**
   * Ambil data terbaru.
   */
  const updatedPurchase =
    await prisma.purchase.findFirst({
      where: {
        id: purchase.id,
        organizationId,
      },
    });

  /**
   * Refresh purchasing page.
   */
  revalidatePath(
    "/dashboard/purchasing"
  );

  return {
    success: true,

    message:
      "Purchase berhasil dikonfirmasi.",

    data: updatedPurchase
      ? {
          ...updatedPurchase,

          totalAmount:
            Number(
              updatedPurchase.totalAmount
            ),

          createdAt:
            updatedPurchase.createdAt.toISOString(),

          updatedAt:
            updatedPurchase.updatedAt.toISOString(),
        }
      : null,
  };
}

/**
 * ============================================================
 * RECEIVE PURCHASE
 * ============================================================
 *
 * CONFIRMED → RECEIVED
 *
 * Ketika purchase diterima:
 *
 * 1. Inventory bertambah.
 * 2. StockMovement IN dibuat.
 * 3. Purchase menjadi RECEIVED.
 *
 * Semua dilakukan dalam satu transaction.
 *
 * Purchase tidak dapat diterima dua kali.
 */

export async function receivePurchase(
  id: string
) {
  await requirePermission(
    "PURCHASE",
    "UPDATE"
  );

  const organizationId =
    await requireOrganizationId();

  try {
    const result =
      await prisma.$transaction(
        async (tx) => {
          /**
           * ==================================================
           * LOCK LOGIC / STATUS TRANSITION
           * ==================================================
           *
           * Hanya CONFIRMED yang dapat dipindahkan
           * menjadi RECEIVED.
           *
           * Jika request kedua masuk ketika purchase
           * sudah RECEIVED, updateMany akan menghasilkan
           * count = 0 sehingga inventory tidak akan
           * diproses lagi.
           */

          const statusUpdate =
            await tx.purchase.updateMany({
              where: {
                id,
                organizationId,
                status: "CONFIRMED",
              },

              data: {
                status: "RECEIVED",
              },
            });

          if (statusUpdate.count === 0) {
            const existingPurchase =
              await tx.purchase.findFirst({
                where: {
                  id,
                  organizationId,
                },

                select: {
                  id: true,
                  status: true,
                },
              });

            if (!existingPurchase) {
              throw new Error(
                "Purchase tidak ditemukan."
              );
            }

            if (
              existingPurchase.status ===
              "RECEIVED"
            ) {
              throw new Error(
                "Purchase sudah pernah diterima."
              );
            }

            throw new Error(
              "Hanya purchase CONFIRMED yang dapat diterima."
            );
          }

          /**
           * ==================================================
           * GET PURCHASE
           * ==================================================
           */

          const purchase =
            await tx.purchase.findFirst({
              where: {
                id,
                organizationId,
              },

              select: {
                id: true,
                invoiceNumber: true,
                warehouseId: true,

                warehouse: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                  },
                },

                items: {
                  select: {
                    id: true,
                    productId: true,
                    quantity: true,

                    product: {
                      select: {
                        id: true,
                        name: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            });

          if (!purchase) {
            throw new Error(
              "Purchase tidak ditemukan."
            );
          }

          /**
           * Warehouse harus ACTIVE.
           */
          if (
            purchase.warehouse.status ===
            "INACTIVE"
          ) {
            throw new Error(
              "Warehouse sudah inactive dan purchase tidak dapat diterima."
            );
          }

          /**
           * Purchase harus memiliki item.
           */
          if (
            purchase.items.length === 0
          ) {
            throw new Error(
              "Purchase tidak memiliki item."
            );
          }

          /**
           * Semua product harus ACTIVE.
           */
          const inactiveProduct =
            purchase.items.find(
              (item) =>
                item.product.status ===
                "INACTIVE"
            );

          if (inactiveProduct) {
            throw new Error(
              `Produk "${inactiveProduct.product.name}" inactive dan purchase tidak dapat diterima.`
            );
          }

          /**
           * ==================================================
           * UPDATE INVENTORY
           * ==================================================
           */

          for (const item of purchase.items) {
            const quantity =
              Number(item.quantity);

            if (
              !Number.isFinite(quantity) ||
              quantity <= 0
            ) {
              throw new Error(
                `Quantity produk "${item.product.name}" tidak valid.`
              );
            }

            /**
             * Cari inventory berdasarkan kombinasi:
             *
             * organizationId
             * productId
             * warehouseId
             */

            const inventory =
              await tx.inventory.findUnique({
                where: {
                  organizationId_productId_warehouseId:
                    {
                      organizationId,

                      productId:
                        item.productId,

                      warehouseId:
                        purchase.warehouseId,
                    },
                },

                select: {
                  id: true,
                  quantity: true,
                },
              });

            if (inventory) {
              /**
               * Inventory sudah ada.
               */
              const currentQuantity =
                Number(
                  inventory.quantity
                );

              const newQuantity =
                currentQuantity +
                quantity;

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
               */
              await tx.inventory.create({
                data: {
                  organizationId,

                  productId:
                    item.productId,

                  warehouseId:
                    purchase.warehouseId,

                  quantity,
                },
              });
            }

            /**
             * ==================================================
             * CREATE STOCK MOVEMENT
             * ==================================================
             */

            await tx.stockMovement.create({
              data: {
                organizationId,

                productId:
                  item.productId,

                warehouseId:
                  purchase.warehouseId,

                type: "IN",

                quantity,

                reference:
                  purchase.invoiceNumber ||
                  purchase.id,

                notes:
                  `Purchase ${
                    purchase.invoiceNumber ||
                    purchase.id
                  } diterima.`,
              },
            });
          }

          /**
           * Ambil purchase terbaru.
           */
          const receivedPurchase =
            await tx.purchase.findFirst({
              where: {
                id,
                organizationId,
              },

              include: purchaseInclude,
            });

          if (!receivedPurchase) {
            throw new Error(
              "Purchase tidak ditemukan setelah proses penerimaan."
            );
          }

          return receivedPurchase;
        }
      );

    /**
     * ========================================================
     * REVALIDATE
     * ========================================================
     */

    revalidatePath(
      "/dashboard/purchasing"
    );

    revalidatePath(
      "/dashboard/inventory"
    );

    revalidatePath(
      "/dashboard/stock-movements"
    );

    return {
      success: true,

      message:
        "Purchase berhasil diterima dan inventory berhasil diperbarui.",

      data: serializePurchase(result),
    };
  } catch (error) {
    console.error(
      "RECEIVE_PURCHASE_ERROR:",
      error
    );

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menerima purchase.",
    };
  }
}

/**
 * ============================================================
 * DELETE PURCHASE
 * ============================================================
 *
 * Hanya DRAFT yang boleh dihapus.
 */

export async function deletePurchase(
  id: string
) {
  await requirePermission(
    "PURCHASE",
    "DELETE"
  );

  const organizationId =
    await requireOrganizationId();

  /**
   * Cari purchase.
   */
  const purchase =
    await prisma.purchase.findFirst({
      where: {
        id,
        organizationId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!purchase) {
    return {
      success: false,
      message:
        "Purchase tidak ditemukan.",
    };
  }

  /**
   * Hanya DRAFT yang boleh dihapus.
   */
  if (purchase.status !== "DRAFT") {
    return {
      success: false,
      message:
        "Hanya purchase DRAFT yang dapat dihapus.",
    };
  }

  /**
   * Delete.
   *
   * PurchaseItem otomatis terhapus karena:
   *
   * purchase Purchase
   * @relation(..., onDelete: Cascade)
   */
  await prisma.purchase.delete({
    where: {
      id: purchase.id,
    },
  });

  /**
   * Refresh purchasing page.
   */
  revalidatePath(
    "/dashboard/purchasing"
  );

  return {
    success: true,

    message:
      "Purchase berhasil dihapus.",
  };
}
