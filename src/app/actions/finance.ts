"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";
import {
  expenseSchema,
  revenueSchema,
  cashFlowSchema,
  type ExpenseInput,
  type RevenueInput,
  type CashFlowInput,
} from "@/lib/validations/finance";

function serializeFinance<T extends { amount: unknown; date: Date; createdAt: Date; updatedAt: Date; [key: string]: unknown }>(item: T) {
  return {
    ...item,
    amount: Number(item.amount),
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

/**
 * ============================================================
 * EXPENSES
 * ============================================================
 */
export async function getExpenses() {
  await requirePermission("EXPENSE", "VIEW");
  const organizationId = await requireOrganizationId();

  const expenses = await prisma.expense.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
  });

  return expenses.map(serializeFinance);
}

export async function createExpense(input: ExpenseInput) {
  await requirePermission("EXPENSE", "CREATE");
  const organizationId = await requireOrganizationId();

  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data pengeluaran tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Cek nomor pengeluaran unik
  const existing = await prisma.expense.findUnique({
    where: {
      organizationId_expenseNumber: {
        organizationId,
        expenseNumber: data.expenseNumber,
      },
    },
  });

  if (existing) {
    return {
      success: false,
      message: "Nomor pengeluaran sudah terdaftar.",
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create expense
    const exp = await tx.expense.create({
      data: {
        organizationId,
        expenseNumber: data.expenseNumber,
        date: data.date,
        category: data.category,
        amount: data.amount,
        notes: data.notes || null,
      },
    });

    // 2. Create CashFlow outflow
    await tx.cashFlow.create({
      data: {
        organizationId,
        entryNumber: `CF-EXP-${Date.now().toString().slice(-8)}`,
        date: data.date,
        type: "OUTFLOW",
        amount: data.amount,
        category: data.category,
        reference: data.expenseNumber,
        notes: data.notes || `Pengeluaran ${data.expenseNumber}`,
      },
    });

    return exp;
  });

  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/cash-flow");

  return {
    success: true,
    message: "Pengeluaran berhasil dicatat.",
    data: serializeFinance(result),
  };
}

export async function deleteExpense(id: string) {
  await requirePermission("EXPENSE", "DELETE");
  const organizationId = await requireOrganizationId();

  const exp = await prisma.expense.findFirst({
    where: { id, organizationId },
  });

  if (!exp) {
    return {
      success: false,
      message: "Pengeluaran tidak ditemukan.",
    };
  }

  await prisma.$transaction(async (tx) => {
    // Hapus cashflow terkait
    await tx.cashFlow.deleteMany({
      where: {
        organizationId,
        reference: exp.expenseNumber,
      },
    });

    // Hapus expense
    await tx.expense.delete({
      where: { id },
    });
  });

  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/cash-flow");

  return {
    success: true,
    message: "Pengeluaran berhasil dihapus.",
  };
}

/**
 * ============================================================
 * REVENUE
 * ============================================================
 */
export async function getRevenues() {
  await requirePermission("REVENUE", "VIEW");
  const organizationId = await requireOrganizationId();

  const revenues = await prisma.revenue.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
  });

  return revenues.map(serializeFinance);
}

export async function createRevenue(input: RevenueInput) {
  await requirePermission("REVENUE", "CREATE");
  const organizationId = await requireOrganizationId();

  const parsed = revenueSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data pendapatan tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existing = await prisma.revenue.findUnique({
    where: {
      organizationId_revenueNumber: {
        organizationId,
        revenueNumber: data.revenueNumber,
      },
    },
  });

  if (existing) {
    return {
      success: false,
      message: "Nomor pendapatan sudah terdaftar.",
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const rev = await tx.revenue.create({
      data: {
        organizationId,
        revenueNumber: data.revenueNumber,
        date: data.date,
        category: data.category,
        amount: data.amount,
        notes: data.notes || null,
      },
    });

    await tx.cashFlow.create({
      data: {
        organizationId,
        entryNumber: `CF-REV-${Date.now().toString().slice(-8)}`,
        date: data.date,
        type: "INFLOW",
        amount: data.amount,
        category: data.category,
        reference: data.revenueNumber,
        notes: data.notes || `Pendapatan ${data.revenueNumber}`,
      },
    });

    return rev;
  });

  revalidatePath("/dashboard/revenue");
  revalidatePath("/dashboard/cash-flow");

  return {
    success: true,
    message: "Pendapatan berhasil dicatat.",
    data: serializeFinance(result),
  };
}

/**
 * ============================================================
 * CASH FLOW
 * ============================================================
 */
export async function getCashFlows() {
  await requirePermission("CASH_FLOW", "VIEW");
  const organizationId = await requireOrganizationId();

  const cashFlows = await prisma.cashFlow.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
  });

  return cashFlows.map(serializeFinance);
}

export async function createCashFlow(input: CashFlowInput) {
  await requirePermission("CASH_FLOW", "CREATE");
  const organizationId = await requireOrganizationId();

  const parsed = cashFlowSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data arus kas tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existing = await prisma.cashFlow.findUnique({
    where: {
      organizationId_entryNumber: {
        organizationId,
        entryNumber: data.entryNumber,
      },
    },
  });

  if (existing) {
    return {
      success: false,
      message: "Nomor entri arus kas sudah terdaftar.",
    };
  }

  const cf = await prisma.cashFlow.create({
    data: {
      organizationId,
      entryNumber: data.entryNumber,
      date: data.date,
      type: data.type,
      amount: data.amount,
      category: data.category,
      reference: data.reference || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/dashboard/cash-flow");

  return {
    success: true,
    message: "Arus kas berhasil dicatat.",
    data: serializeFinance(cf),
  };
}
