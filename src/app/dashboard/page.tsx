import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireOrganizationId,
} from "@/lib/authorization";
import {
  Users,
  Package,
  Building2,
  Warehouse,
  ShoppingCart,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Boxes,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock
} from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const organizationId = await requireOrganizationId();

  const [
    customerCount,
    productCount,
    supplierCount,
    warehouseCount,
    saleCount,
    invoiceCount,
  ] = await Promise.all([
    prisma.customer.count({
      where: { organizationId },
    }),
    prisma.product.count({
      where: { organizationId },
    }),
    prisma.supplier.count({
      where: { organizationId },
    }),
    prisma.warehouse.count({
      where: { organizationId },
    }),
    prisma.sale.count({
      where: { organizationId },
    }),
    prisma.invoice.count({
      where: { organizationId },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* HEADER & WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Zap className="h-3.5 w-3.5" />
              <span>Multi-Tenant ERP Active</span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {user.name}!
            </h1>
            <p className="mt-1 text-sm text-indigo-200">
              Logged in as <span className="font-semibold text-white">{user.email}</span> • Multi-tenant organization session active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-indigo-950 shadow-md transition hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
            <Link
              href="/dashboard/sales"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-500"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>New Sales Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* PRIMARY METRICS GRID */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* CUSTOMERS */}
        <Link href="/dashboard/customers" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Customers</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{customerCount}</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" /> Active
            </span>
          </div>
        </Link>

        {/* PRODUCTS */}
        <Link href="/dashboard/products" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Catalog Products</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{productCount}</p>
            <span className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              In Catalog
            </span>
          </div>
        </Link>

        {/* SUPPLIERS */}
        <Link href="/dashboard/suppliers" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Suppliers</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{supplierCount}</p>
            <span className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              Vendors
            </span>
          </div>
        </Link>

        {/* WAREHOUSES */}
        <Link href="/dashboard/warehouses" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Warehouses</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Warehouse className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{warehouseCount}</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Operational
            </span>
          </div>
        </Link>
      </div>

      {/* MODULE SHORTCUTS & ACTIVITY */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">ERP Quick Workflows</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Direct shortcuts to primary management screens</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/inventory"
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-500/40 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Boxes className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Stock Balances</p>
                <p className="text-xs text-slate-500">Monitor stock levels per location</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/sales"
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-500/40 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Sales & Orders ({saleCount})</p>
                <p className="text-xs text-slate-500">Manage customer purchase orders</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-500/40 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Invoices ({invoiceCount})</p>
                <p className="text-xs text-slate-500">Issue and track billing invoices</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/cash-flow"
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-500/40 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Cash Flow & Reports</p>
                <p className="text-xs text-slate-500">View real-time inflows & outflows</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* System Health / Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Security Status</h3>
              <p className="text-xs text-slate-500">RBAC Multi-Tenant Engine</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Organization ID</span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">{organizationId}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Database Engine</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">PostgreSQL (Prisma)</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Tenant Isolation</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">ENFORCED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}