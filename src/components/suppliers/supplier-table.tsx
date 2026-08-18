"use client";

import type { Supplier } from "@prisma/client";
import { useMemo, useState } from "react";

type SupplierTableProps = {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  deleteLoading?: boolean;
};

export function SupplierTable({
  suppliers,
  onEdit,
  onDelete,
  deleteLoading = false,
}: SupplierTableProps) {
  const [search, setSearch] = useState("");

  const filteredSuppliers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      return (
        supplier.code.toLowerCase().includes(keyword) ||
        supplier.name.toLowerCase().includes(keyword) ||
        supplier.email
          ?.toLowerCase()
          .includes(keyword) ||
        supplier.phone
          ?.toLowerCase()
          .includes(keyword) ||
        supplier.city
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [suppliers, search]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Supplier List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredSuppliers.length} supplier
            {filteredSuppliers.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="w-full sm:w-80">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search supplier..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredSuppliers.length === 0 && (
        <div className="flex min-h-48 items-center justify-center p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              {suppliers.length === 0
                ? "Belum ada supplier."
                : "Supplier tidak ditemukan."}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {suppliers.length === 0
                ? "Tambahkan supplier pertama menggunakan tombol Add Supplier."
                : "Coba gunakan kata kunci pencarian yang berbeda."}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredSuppliers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 font-semibold text-slate-600">
                  Code
                </th>

                <th className="px-5 py-3 font-semibold text-slate-600">
                  Supplier
                </th>

                <th className="px-5 py-3 font-semibold text-slate-600">
                  Contact
                </th>

                <th className="px-5 py-3 font-semibold text-slate-600">
                  Location
                </th>

                <th className="px-5 py-3 font-semibold text-slate-600">
                  Status
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSuppliers.map((supplier) => (
                <SupplierRow
                  key={supplier.id}
                  supplier={supplier}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  deleteLoading={deleteLoading}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SupplierRow({
  supplier,
  onEdit,
  onDelete,
  deleteLoading,
}: {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  deleteLoading: boolean;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
      {/* Code */}
      <td className="whitespace-nowrap px-5 py-4">
        <span className="font-medium text-slate-900">
          {supplier.code}
        </span>
      </td>

      {/* Supplier */}
      <td className="px-5 py-4">
        <div>
          <p className="font-medium text-slate-900">
            {supplier.name}
          </p>

          {supplier.notes && (
            <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
              {supplier.notes}
            </p>
          )}
        </div>
      </td>

      {/* Contact */}
      <td className="px-5 py-4">
        <div className="space-y-1">
          {supplier.email ? (
            <p className="text-slate-700">
              {supplier.email}
            </p>
          ) : (
            <p className="text-slate-400">
              No email
            </p>
          )}

          {supplier.phone ? (
            <p className="text-xs text-slate-500">
              {supplier.phone}
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              No phone
            </p>
          )}
        </div>
      </td>

      {/* Location */}
      <td className="px-5 py-4">
        <div>
          <p className="text-slate-700">
            {supplier.city || "-"}
          </p>

          <p className="text-xs text-slate-400">
            {supplier.country}
          </p>
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge status={supplier.status} />
      </td>

      {/* Actions */}
      <td className="whitespace-nowrap px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onEdit(supplier)}
          disabled={deleteLoading}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(supplier)}
          disabled={deleteLoading}
          className="ml-1 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

function StatusBadge({
  status,
}: {
  status: Supplier["status"];
}) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={
        isActive
          ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
          : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}