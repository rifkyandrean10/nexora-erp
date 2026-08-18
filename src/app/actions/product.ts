"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

import {
  productSchema,
  type ProductInput,
} from "@/lib/validations/product";

/**
 * CREATE PRODUCT
 */
export async function createProduct(
  input: ProductInput
) {
  await requirePermission(
    "PRODUCT",
    "CREATE"
  );

  const organizationId =
    await requireOrganizationId();

  const parsed =
    productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data produk tidak valid.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const code = data.code.trim().toUpperCase();
  const name = data.name.trim();
  const unit = data.unit.trim();

  /*
   * Pastikan category merupakan milik
   * organization yang sedang aktif.
   */
  const category =
    await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

  if (!category) {
    return {
      success: false,
      message:
        "Kategori tidak ditemukan.",
    };
  }

  /*
   * Cek duplicate product code
   * dalam organization yang sama.
   */
  const existingProduct =
    await prisma.product.findFirst({
      where: {
        organizationId,
        code,
      },
      select: {
        id: true,
      },
    });

  if (existingProduct) {
    return {
      success: false,
      message:
        "Kode produk sudah digunakan.",
    };
  }

  /*
   * Harga jual tidak boleh lebih kecil
   * dari harga beli.
   */
  if (
    data.sellingPrice <
    data.purchasePrice
  ) {
    return {
      success: false,
      message:
        "Harga jual tidak boleh lebih kecil dari harga beli.",
    };
  }

  const product =
    await prisma.product.create({
      data: {
        organizationId,

        categoryId:
          category.id,

        code,

        name,

        description:
          data.description?.trim() || null,

        unit,

        purchasePrice:
          data.purchasePrice,

        sellingPrice:
          data.sellingPrice,

        status:
          data.status,
      },

      include: {
        category: true,
      },
    });

  revalidatePath(
    "/dashboard/products"
  );

  return {
    success: true,
    message:
      "Produk berhasil dibuat.",
    data: product,
  };
}

/**
 * UPDATE PRODUCT
 */
export async function updateProduct(
  id: string,
  input: ProductInput
) {
  await requirePermission(
    "PRODUCT",
    "UPDATE"
  );

  const organizationId =
    await requireOrganizationId();

  const parsed =
    productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data produk tidak valid.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const product =
    await prisma.product.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
      },
    });

  if (!product) {
    return {
      success: false,
      message:
        "Produk tidak ditemukan.",
    };
  }

  const category =
    await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

  if (!category) {
    return {
      success: false,
      message:
        "Kategori tidak ditemukan.",
    };
  }

  const code = data.code.trim().toUpperCase();
  const name = data.name.trim();
  const unit = data.unit.trim();

  /*
   * Pastikan code tidak digunakan
   * oleh product lain.
   */
  const duplicate =
    await prisma.product.findFirst({
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

  if (duplicate) {
    return {
      success: false,
      message:
        "Kode produk sudah digunakan.",
    };
  }

  if (
    data.sellingPrice <
    data.purchasePrice
  ) {
    return {
      success: false,
      message:
        "Harga jual tidak boleh lebih kecil dari harga beli.",
    };
  }

  const updatedProduct =
    await prisma.product.update({
      where: {
        id: product.id,
      },

      data: {
        categoryId:
          category.id,

        code,

        name,

        description:
          data.description?.trim() || null,

        unit,

        purchasePrice:
          data.purchasePrice,

        sellingPrice:
          data.sellingPrice,

        status:
          data.status,
      },

      include: {
        category: true,
      },
    });

  revalidatePath(
    "/dashboard/products"
  );

  return {
    success: true,
    message:
      "Produk berhasil diperbarui.",
    data: updatedProduct,
  };
}

/**
 * DELETE PRODUCT
 */
export async function deleteProduct(
  id: string
) {
  await requirePermission(
    "PRODUCT",
    "DELETE"
  );

  const organizationId =
    await requireOrganizationId();

  const product =
    await prisma.product.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
      },
    });

  if (!product) {
    return {
      success: false,
      message:
        "Produk tidak ditemukan.",
    };
  }

  /*
   * Untuk sekarang Product belum
   * memiliki relasi Inventory,
   * Purchase, atau Sales.
   *
   * Jadi delete masih diperbolehkan.
   *
   * Nanti ketika transaksi sudah dibuat,
   * aturan delete akan diperketat.
   */
  await prisma.product.delete({
    where: {
      id: product.id,
    },
  });

  revalidatePath(
    "/dashboard/products"
  );

  return {
    success: true,
    message:
      "Produk berhasil dihapus.",
  };
}

/**
 * GET PRODUCTS
 */
export async function getProducts() {
  await requirePermission(
    "PRODUCT",
    "VIEW"
  );

  const organizationId =
    await requireOrganizationId();

  const products =
    await prisma.product.findMany({
      where: {
        organizationId,
      },

      include: {
        category: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return products;
}