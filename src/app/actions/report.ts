"use server";

import { prisma } from "@/lib/prisma";
import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

export async function getReportSummary() {
  await requirePermission("REPORT", "VIEW");
  const organizationId = await requireOrganizationId();

  // 1. Get totals
  const sales = await prisma.sale.findMany({
    where: {
      organizationId,
      status: "SHIPPED", // Only count shipped sales
    },
    select: {
      totalAmount: true,
    },
  });

  const purchases = await prisma.purchase.findMany({
    where: {
      organizationId,
      status: "RECEIVED",
    },
    select: {
      totalAmount: true,
    },
  });

  const expenses = await prisma.expense.findMany({
    where: { organizationId },
    select: { amount: true },
  });

  const revenues = await prisma.revenue.findMany({
    where: { organizationId },
    select: { amount: true },
  });

  const totalSales = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalRevenues = revenues.reduce((sum, r) => sum + Number(r.amount), 0);

  // Cash flow summary
  const cashFlows = await prisma.cashFlow.findMany({
    where: { organizationId },
    select: {
      type: true,
      amount: true,
    },
  });

  const totalInflow = cashFlows
    .filter((cf) => cf.type === "INFLOW")
    .reduce((sum, cf) => sum + Number(cf.amount), 0);

  const totalOutflow = cashFlows
    .filter((cf) => cf.type === "OUTFLOW")
    .reduce((sum, cf) => sum + Number(cf.amount), 0);

  // 2. Inventory Valuation
  const inventories = await prisma.inventory.findMany({
    where: { organizationId },
    include: {
      product: {
        select: {
          purchasePrice: true,
        },
      },
    },
  });

  const inventoryValuation = inventories.reduce(
    (sum, inv) => sum + Number(inv.quantity) * Number(inv.product.purchasePrice),
    0
  );

  return {
    totalSales,
    totalPurchases,
    totalExpenses,
    totalRevenues,
    totalInflow,
    totalOutflow,
    netProfit: totalSales + totalRevenues - totalPurchases - totalExpenses,
    netCashFlow: totalInflow - totalOutflow,
    inventoryValuation,
  };
}
