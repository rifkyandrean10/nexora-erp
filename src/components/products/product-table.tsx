"use client";

import { useMemo, useState } from "react";

type Category = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
};

type Product = {
  id: string;
  organizationId: string;
  categoryId: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
  category: Category;
};

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (
    product: Product
  ) => Promise<void>;
  deleteLoading: boolean;
};

function formatPrice(
  value: number
) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  deleteLoading,
}: ProductTableProps) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "ALL" | "ACTIVE" | "INACTIVE"
    >("ALL");

  const filteredProducts =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            !keyword ||
            [
              product.code,
              product.name,
              product.unit,
              product.category
                ?.name ?? "",
              product.description ??
                "",
            ]
              .join(" ")
              .toLowerCase()
              .includes(keyword);

          const matchesStatus =
            statusFilter === "ALL" ||
            product.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      products,
      search,
      statusFilter,
    ]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Filters */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Cari produk..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:max-w-sm"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as
                | "ALL"
                | "ACTIVE"
                | "INACTIVE"
            )
          }
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
        >
          <option value="ALL">
            Semua Status
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Product
              </th>

              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Category
              </th>

              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Unit
              </th>

              <th className="px-4 py-3 text-right font-medium text-slate-700">
                Harga Beli
              </th>

              <th className="px-4 py-3 text-right font-medium text-slate-700">
                Harga Jual
              </th>

              <th className="px-4 py-3 text-center font-medium text-slate-700">
                Status
              </th>

              <th className="px-4 py-3 text-right font-medium text-slate-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length ===
            0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Tidak ada produk
                  ditemukan.
                </td>
              </tr>
            ) : (
              filteredProducts.map(
                (product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {product.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {product.code}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {product.category
                        ?.name || "-"}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {product.unit}
                    </td>

                    <td className="px-4 py-4 text-right text-slate-600">
                      {formatPrice(
                        product.purchasePrice
                      )}
                    </td>

                    <td className="px-4 py-4 text-right font-medium text-slate-900">
                      {formatPrice(
                        product.sellingPrice
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={
                          product.status ===
                          "ACTIVE"
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                        }
                      >
                        {product.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(product)
                          }
                          disabled={
                            deleteLoading
                          }
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onDelete(product)
                          }
                          disabled={
                            deleteLoading
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}