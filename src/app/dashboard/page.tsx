import { prisma } from "@/lib/prisma";

import {
  requireAuth,
  requireOrganizationId,
} from "@/lib/authorization";

export default async function DashboardPage() {
  const user = await requireAuth();

  const organizationId =
    await requireOrganizationId();

  const [
    customerCount,
    productCount,
  ] = await Promise.all([
    prisma.customer.count({
      where: {
        organizationId,
      },
    }),

    prisma.product.count({
      where: {
        organizationId,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Nexora Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Welcome, {user.name}
        </p>

        <p className="text-sm text-slate-500">
          {user.email}
        </p>
      </div>

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* CUSTOMERS */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Customers
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {customerCount}
          </p>
        </div>

        {/* PRODUCTS */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Products
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {productCount}
          </p>
        </div>

        {/* SALES */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Sales
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            Rp 0
          </p>
        </div>

        {/* INVENTORY */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Inventory
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            0
          </p>
        </div>
      </div>
    </div>
  );
}