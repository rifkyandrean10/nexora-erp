"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";
import {
  saleSchema,
  type SaleInput,
} from "@/lib/validations/sale";

/**
 * ============================================================
 * SERIALIZATION
 * ============================================================
 */
function serializeSale<
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
>(sale: T) {
  return {
    ...sale,
    totalAmount: Number(sale.totalAmount),
    createdAt: sale.createdAt.toISOString(),
    updatedAt: sale.updatedAt.toISOString(),
    items: sale.items?.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
  };
}

const saleInclude = {
  customer: {
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
  invoice: {
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      totalAmount: true,
      paidAmount: true,
    },
  },
} as const;

/**
 * ============================================================
 * GET SALES
 * ============================================================
 */
export async function getSales() {
  await requirePermission("SALES", "VIEW");
  const organizationId = await requireOrganizationId();

  const sales = await prisma.sale.findMany({
    where: {
      organizationId,
    },
    include: saleInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return sales.map(serializeSale);
}

/**
 * ============================================================
 * GET SINGLE SALE
 * ============================================================
 */
export async function getSaleById(id: string) {
  await requirePermission("SALES", "VIEW");
  const organizationId = await requireOrganizationId();

  const sale = await prisma.sale.findFirst({
    where: {
      id,
      organizationId,
    },
    include: saleInclude,
  });

  if (!sale) {
    return {
      success: false,
      message: "Penjualan tidak ditemukan.",
    };
  }

  return {
    success: true,
    data: serializeSale(sale),
  };
}

/**
 * ============================================================
 * CREATE SALE
 * ============================================================
 */
export async function createSale(input: SaleInput) {
  await requirePermission("SALES", "CREATE");
  const organizationId = await requireOrganizationId();

  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data penjualan tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  if (data.items.length === 0) {
    return {
      success: false,
      message: "Penjualan harus memiliki minimal satu item.",
    };
  }

  const productIds = data.items.map((item) => item.productId);
  const uniqueProductIds = new Set(productIds);
  if (uniqueProductIds.size !== productIds.length) {
    return {
      success: false,
      message: "Produk yang sama tidak boleh ditambahkan lebih dari satu kali dalam penjualan.",
    };
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id: data.customerId,
      organizationId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!customer) {
    return {
      success: false,
      message: "Customer tidak ditemukan.",
    };
  }

  if (customer.status === "INACTIVE") {
    return {
      success: false,
      message: "Customer nonaktif tidak dapat digunakan.",
    };
  }

  const warehouse = await prisma.warehouse.findFirst({
    where: {
      id: data.warehouseId,
      organizationId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!warehouse) {
    return {
      success: false,
      message: "Warehouse tidak ditemukan.",
    };
  }

  if (warehouse.status === "INACTIVE") {
    return {
      success: false,
      message: "Warehouse nonaktif tidak dapat digunakan.",
    };
  }

  const products = await prisma.product.findMany({
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

  if (products.length !== productIds.length) {
    return {
      success: false,
      message: "Salah satu produk tidak ditemukan.",
    };
  }

  const inactiveProduct = products.find((product) => product.status === "INACTIVE");
  if (inactiveProduct) {
    return {
      success: false,
      message: `Produk "${inactiveProduct.name}" nonaktif dan tidak dapat digunakan.`,
    };
  }

  const items = data.items.map((item) => {
    const subtotal = item.quantity * item.unitPrice;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal,
    };
  });

  const totalAmount = items.reduce((total, item) => total + item.subtotal, 0);

  const sale = await prisma.sale.create({
    data: {
      organizationId,
      customerId: data.customerId,
      warehouseId: data.warehouseId,
      invoiceNumber: data.invoiceNumber?.trim() || null,
      notes: data.notes?.trim() || null,
      status: "DRAFT",
      totalAmount,
      items: {
        create: items,
      },
    },
    include: saleInclude,
  });

  revalidatePath("/dashboard/sales");

  return {
    success: true,
    message: "Penjualan berhasil dibuat.",
    data: serializeSale(sale),
  };
}

/**
 * ============================================================
 * UPDATE SALE
 * ============================================================
 */
export async function updateSale(id: string, input: SaleInput) {
  await requirePermission("SALES", "UPDATE");
  const organizationId = await requireOrganizationId();

  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data penjualan tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existingSale = await prisma.sale.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingSale) {
    return {
      success: false,
      message: "Penjualan tidak ditemukan.",
    };
  }

  if (existingSale.status !== "DRAFT") {
    return {
      success: false,
      message: "Hanya penjualan berstatus DRAFT yang dapat diperbarui.",
    };
  }

  const productIds = data.items.map((item) => item.productId);
  const uniqueProductIds = new Set(productIds);
  if (uniqueProductIds.size !== productIds.length) {
    return {
      success: false,
      message: "Produk yang sama tidak boleh ditambahkan lebih dari satu kali.",
    };
  }

  const items = data.items.map((item) => {
    const subtotal = item.quantity * item.unitPrice;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal,
    };
  });

  const totalAmount = items.reduce((total, item) => total + item.subtotal, 0);

  const updatedSale = await prisma.$transaction(async (tx) => {
    await tx.saleItem.deleteMany({
      where: {
        saleId: id,
      },
    });

    return tx.sale.update({
      where: {
        id,
      },
      data: {
        customerId: data.customerId,
        warehouseId: data.warehouseId,
        invoiceNumber: data.invoiceNumber?.trim() || null,
        notes: data.notes?.trim() || null,
        totalAmount,
        items: {
          create: items,
        },
      },
      include: saleInclude,
    });
  });

  revalidatePath("/dashboard/sales");

  return {
    success: true,
    message: "Penjualan berhasil diperbarui.",
    data: serializeSale(updatedSale),
  };
}

/**
 * ============================================================
 * CONFIRM SALE (DRAFT -> CONFIRMED & AUTO INVOICE)
 * ============================================================
 */
export async function confirmSale(id: string) {
  await requirePermission("SALES", "UPDATE");
  const organizationId = await requireOrganizationId();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: {
          id,
          organizationId,
        },
        include: {
          items: true,
        },
      });

      if (!sale) {
        throw new Error("Penjualan tidak ditemukan.");
      }

      if (sale.status !== "DRAFT") {
        throw new Error("Hanya penjualan DRAFT yang dapat dikonfirmasi.");
      }

      // Update status
      const updatedSale = await tx.sale.update({
        where: {
          id,
        },
        data: {
          status: "CONFIRMED",
        },
        include: saleInclude,
      });

      // Auto-generate invoice
      const invoiceNumber = `INV-SALE-${Date.now().toString().slice(-8)}`;
      await tx.invoice.create({
        data: {
          organizationId,
          invoiceNumber,
          type: "SALE",
          status: "UNPAID",
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
          saleId: sale.id,
          totalAmount: sale.totalAmount,
          paidAmount: 0,
        },
      });

      return updatedSale;
    });

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/invoices");

    return {
      success: true,
      message: "Penjualan dikonfirmasi dan Invoice diterbitkan otomatis.",
      data: serializeSale(result),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengonfirmasi penjualan.",
    };
  }
}

/**
 * ============================================================
 * SHIP SALE (CONFIRMED -> SHIPPED & STOCK DEDUCTION)
 * ============================================================
 */
export async function shipSale(id: string) {
  await requirePermission("SALES", "UPDATE");
  const organizationId = await requireOrganizationId();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: {
          id,
          organizationId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!sale) {
        throw new Error("Penjualan tidak ditemukan.");
      }

      if (sale.status !== "CONFIRMED") {
        throw new Error("Hanya penjualan CONFIRMED yang dapat dikirim.");
      }

      // Deduct stock and record movements
      for (const item of sale.items) {
        const qty = Number(item.quantity);

        const inventory = await tx.inventory.findUnique({
          where: {
            organizationId_productId_warehouseId: {
              organizationId,
              productId: item.productId,
              warehouseId: sale.warehouseId,
            },
          },
        });

        if (!inventory || Number(inventory.quantity) < qty) {
          throw new Error(
            `Stok untuk produk "${item.product.name}" di gudang ini tidak mencukupi (Tersedia: ${inventory ? Number(inventory.quantity) : 0}).`
          );
        }

        const newQty = Number(inventory.quantity) - qty;

        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            quantity: newQty,
          },
        });

        await tx.stockMovement.create({
          data: {
            organizationId,
            productId: item.productId,
            warehouseId: sale.warehouseId,
            type: "OUT",
            quantity: qty,
            reference: sale.invoiceNumber || sale.id,
            notes: `Penjualan ${sale.id}`,
          },
        });
      }

      // Update status
      return tx.sale.update({
        where: {
          id,
        },
        data: {
          status: "SHIPPED",
        },
        include: saleInclude,
      });
    });

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/stock-movements");

    return {
      success: true,
      message: "Penjualan berhasil dikirim dan stok gudang dikurangi.",
      data: serializeSale(result),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengirim penjualan.",
    };
  }
}

/**
 * ============================================================
 * DELETE SALE
 * ============================================================
 */
export async function deleteSale(id: string) {
  await requirePermission("SALES", "DELETE");
  const organizationId = await requireOrganizationId();

  const existingSale = await prisma.sale.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingSale) {
    return {
      success: false,
      message: "Penjualan tidak ditemukan.",
    };
  }

  if (existingSale.status !== "DRAFT") {
    return {
      success: false,
      message: "Hanya penjualan DRAFT yang dapat dihapus.",
    };
  }

  await prisma.sale.delete({
    where: {
      id,
    },
  });

  revalidatePath("/dashboard/sales");

  return {
    success: true,
    message: "Penjualan berhasil dihapus.",
  };
}
