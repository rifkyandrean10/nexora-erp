"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";
import {
  paymentSchema,
  type PaymentInput,
} from "@/lib/validations/payment";

function serializePayment<
  T extends {
    amount: unknown;
    paymentDate: Date;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: unknown;
  },
>(payment: T) {
  return {
    ...payment,
    amount: Number(payment.amount),
    paymentDate: payment.paymentDate.toISOString(),
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

const paymentInclude = {
  invoice: {
    select: {
      id: true,
      invoiceNumber: true,
      type: true,
      status: true,
      totalAmount: true,
      paidAmount: true,
    },
  },
} as const;

export async function getPayments() {
  await requirePermission("PAYMENT", "VIEW");
  const organizationId = await requireOrganizationId();

  const payments = await prisma.payment.findMany({
    where: {
      organizationId,
    },
    include: paymentInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments.map(serializePayment);
}

export async function getPaymentsByInvoiceId(invoiceId: string) {
  await requirePermission("PAYMENT", "VIEW");
  const organizationId = await requireOrganizationId();

  const payments = await prisma.payment.findMany({
    where: {
      organizationId,
      invoiceId,
    },
    include: paymentInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments.map(serializePayment);
}

export async function createPayment(input: PaymentInput) {
  await requirePermission("PAYMENT", "CREATE");
  const organizationId = await requireOrganizationId();

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data pembayaran tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the invoice
      const invoice = await tx.invoice.findFirst({
        where: {
          id: data.invoiceId,
          organizationId,
        },
      });

      if (!invoice) {
        throw new Error("Invoice tidak ditemukan.");
      }

      if (invoice.status === "PAID") {
        throw new Error("Invoice sudah lunas.");
      }

      const total = Number(invoice.totalAmount);
      const prevPaid = Number(invoice.paidAmount);
      const paymentAmount = data.amount;

      if (prevPaid + paymentAmount > total) {
        throw new Error("Jumlah pembayaran melebihi sisa tagihan.");
      }

      const newPaid = prevPaid + paymentAmount;
      let newStatus: "PAID" | "PARTIALLY_PAID" = "PARTIALLY_PAID";
      if (newPaid >= total) {
        newStatus = "PAID";
      }

      // 2. Update Invoice status & paidAmount
      await tx.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          paidAmount: newPaid,
          status: newStatus,
        },
      });

      // 3. Create the Payment
      const payment = await tx.payment.create({
        data: {
          organizationId,
          invoiceId: data.invoiceId,
          paymentNumber: data.paymentNumber,
          paymentDate: data.paymentDate,
          amount: paymentAmount,
          method: data.method,
          reference: data.reference || null,
          notes: data.notes || null,
        },
        include: paymentInclude,
      });

      // 4. Record to Finance & Cash Flow
      if (invoice.type === "SALE") {
        // Inflow
        // Create CashFlow
        await tx.cashFlow.create({
          data: {
            organizationId,
            entryNumber: `CF-IN-${Date.now().toString().slice(-8)}`,
            date: data.paymentDate,
            type: "INFLOW",
            amount: paymentAmount,
            category: "Penjualan (Sales)",
            reference: invoice.invoiceNumber,
            notes: `Pembayaran tagihan penjualan ${invoice.invoiceNumber}`,
          },
        });

        // Create Revenue
        await tx.revenue.create({
          data: {
            organizationId,
            revenueNumber: `REV-${Date.now().toString().slice(-8)}`,
            date: data.paymentDate,
            category: "Penjualan (Sales)",
            amount: paymentAmount,
            notes: `Pendapatan dari invoice ${invoice.invoiceNumber}`,
          },
        });
      } else {
        // Outflow (Purchase Payment)
        // Create CashFlow
        await tx.cashFlow.create({
          data: {
            organizationId,
            entryNumber: `CF-OUT-${Date.now().toString().slice(-8)}`,
            date: data.paymentDate,
            type: "OUTFLOW",
            amount: paymentAmount,
            category: "Pembelian (Purchasing)",
            reference: invoice.invoiceNumber,
            notes: `Pembayaran tagihan pembelian ${invoice.invoiceNumber}`,
          },
        });

        // Create Expense
        await tx.expense.create({
          data: {
            organizationId,
            expenseNumber: `EXP-${Date.now().toString().slice(-8)}`,
            date: data.paymentDate,
            category: "Pembelian (Purchasing)",
            amount: paymentAmount,
            notes: `Pengeluaran untuk invoice ${invoice.invoiceNumber}`,
          },
        });
      }

      return payment;
    });

    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/cash-flow");
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/revenue");

    return {
      success: true,
      message: "Pembayaran berhasil dicatat.",
      data: serializePayment(result),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mencatat pembayaran.",
    };
  }
}
