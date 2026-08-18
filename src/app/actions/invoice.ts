"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";
import {
  invoiceSchema,
  type InvoiceInput,
} from "@/lib/validations/invoice";

function serializeInvoice<
  T extends {
    totalAmount: unknown;
    paidAmount: unknown;
    issueDate: Date;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: unknown;
  },
>(invoice: T) {
  return {
    ...invoice,
    totalAmount: Number(invoice.totalAmount),
    paidAmount: Number(invoice.paidAmount),
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}

const invoiceInclude = {
  sale: {
    select: {
      id: true,
      customerId: true,
      customer: {
        select: {
          name: true,
        },
      },
    },
  },
  purchase: {
    select: {
      id: true,
      supplierId: true,
      supplier: {
        select: {
          name: true,
        },
      },
    },
  },
} as const;

export async function getInvoices() {
  await requirePermission("INVOICE", "VIEW");
  const organizationId = await requireOrganizationId();

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
    },
    include: invoiceInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return invoices.map(serializeInvoice);
}

export async function getInvoiceById(id: string) {
  await requirePermission("INVOICE", "VIEW");
  const organizationId = await requireOrganizationId();

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      organizationId,
    },
    include: invoiceInclude,
  });

  if (!invoice) {
    return {
      success: false,
      message: "Invoice tidak ditemukan.",
    };
  }

  return {
    success: true,
    data: serializeInvoice(invoice),
  };
}

export async function createInvoice(input: InvoiceInput) {
  await requirePermission("INVOICE", "CREATE");
  const organizationId = await requireOrganizationId();

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data invoice tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Cek nomor invoice unik untuk organisasi tersebut
  const existingInvoice = await prisma.invoice.findUnique({
    where: {
      organizationId_invoiceNumber: {
        organizationId,
        invoiceNumber: data.invoiceNumber,
      },
    },
  });

  if (existingInvoice) {
    return {
      success: false,
      message: "Nomor invoice sudah digunakan.",
    };
  }

  const invoice = await prisma.invoice.create({
    data: {
      organizationId,
      invoiceNumber: data.invoiceNumber,
      type: data.type,
      status: "UNPAID",
      dueDate: data.dueDate,
      issueDate: data.issueDate,
      saleId: data.saleId || null,
      purchaseId: data.purchaseId || null,
      totalAmount: data.totalAmount,
      paidAmount: 0,
    },
    include: invoiceInclude,
  });

  revalidatePath("/dashboard/invoices");

  return {
    success: true,
    message: "Invoice berhasil dibuat.",
    data: serializeInvoice(invoice),
  };
}

export async function updateInvoice(id: string, input: InvoiceInput) {
  await requirePermission("INVOICE", "UPDATE");
  const organizationId = await requireOrganizationId();

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data invoice tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!existingInvoice) {
    return {
      success: false,
      message: "Invoice tidak ditemukan.",
    };
  }

  const updatedInvoice = await prisma.invoice.update({
    where: {
      id,
    },
    data: {
      invoiceNumber: data.invoiceNumber,
      dueDate: data.dueDate,
      issueDate: data.issueDate,
      totalAmount: data.totalAmount,
    },
    include: invoiceInclude,
  });

  revalidatePath("/dashboard/invoices");

  return {
    success: true,
    message: "Invoice berhasil diperbarui.",
    data: serializeInvoice(updatedInvoice),
  };
}
