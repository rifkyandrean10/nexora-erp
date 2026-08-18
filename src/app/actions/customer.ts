"use server";

import { prisma } from "@/lib/prisma";
import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

import {
  customerSchema,
  type CustomerInput,
} from "@/lib/validations/customer";

/**
 * CREATE CUSTOMER
 */
export async function createCustomer(input: CustomerInput) {
  await requirePermission("CUSTOMER", "CREATE");

  const organizationId = await requireOrganizationId();

  const parsed = customerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data customer tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      organizationId,
      code: data.code,
    },
    select: {
      id: true,
    },
  });

  if (existingCustomer) {
    return {
      success: false,
      message: "Kode customer sudah digunakan.",
    };
  }

  const customer = await prisma.customer.create({
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
    message: "Customer berhasil dibuat.",
    data: customer,
  };
}

/**
 * UPDATE CUSTOMER
 */
export async function updateCustomer(
  id: string,
  input: CustomerInput
) {
  await requirePermission("CUSTOMER", "UPDATE");

  const organizationId = await requireOrganizationId();

  const parsed = customerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data customer tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  /**
   * Pastikan customer memang milik organization
   * user yang sedang login.
   */
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    return {
      success: false,
      message: "Customer tidak ditemukan.",
    };
  }

  /**
   * Pastikan kode tidak digunakan customer lain
   * dalam organization yang sama.
   */
  const duplicate = await prisma.customer.findFirst({
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
      message: "Kode customer sudah digunakan.",
    };
  }

  const updatedCustomer = await prisma.customer.update({
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
    message: "Customer berhasil diperbarui.",
    data: updatedCustomer,
  };
}

/**
 * DELETE CUSTOMER
 */
export async function deleteCustomer(id: string) {
  await requirePermission("CUSTOMER", "DELETE");

  const organizationId = await requireOrganizationId();

  /**
   * Cari berdasarkan id + organizationId.
   *
   * Ini penting untuk mencegah user menghapus
   * customer milik organization lain.
   */
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    return {
      success: false,
      message: "Customer tidak ditemukan.",
    };
  }

  await prisma.customer.delete({
    where: {
      id: customer.id,
    },
  });

  return {
    success: true,
    message: "Customer berhasil dihapus.",
  };
}

/**
 * GET CUSTOMERS
 */
export async function getCustomers() {
  await requirePermission("CUSTOMER", "VIEW");

  const organizationId = await requireOrganizationId();

  const customers = await prisma.customer.findMany({
    where: {
      organizationId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return customers;
}