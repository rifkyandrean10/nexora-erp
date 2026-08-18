"use client";

import {
  useMemo,
  useState,
} from "react";

import type { Warehouse } from "./warehouse-page";

type WarehouseTableProps = {
  warehouses: Warehouse[];
  onEdit: (
    warehouse: Warehouse
  ) => void;
  onDelete: (
    warehouse: Warehouse
  ) => Promise<void>;
  deleteLoading: boolean;
};

export function WarehouseTable({
  warehouses,
  onEdit,
  onDelete,
  deleteLoading,
}: WarehouseTableProps) {
  const [search, setSearch] =
    useState("");

  const filteredWarehouses =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return warehouses;
      }

      return warehouses.filter(
        (warehouse) =>
          [
            warehouse.code,
            warehouse.name,
            warehouse.city ?? "",
            warehouse.country,
            warehouse.description ?? "",
            warehouse.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(keyword)
      );
    }, [warehouses, search]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Cari warehouse..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:max-w-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Warehouse
              </th>

              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Lokasi
              </th>

              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Deskripsi
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
            {filteredWarehouses.length ===
            0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Tidak ada warehouse
                  ditemukan.
                </td>
              </tr>
            ) : (
              filteredWarehouses.map(
                (warehouse) => (
                  <tr
                    key={warehouse.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {warehouse.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {warehouse.code}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {[
                        warehouse.city,
                        warehouse.country,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                        "-"}
                    </td>

                    <td className="max-w-md px-4 py-4 text-slate-500">
                      {warehouse.description ||
                        "-"}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={
                          warehouse.status ===
                          "ACTIVE"
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                        }
                      >
                        {warehouse.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(
                              warehouse
                            )
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
                            onDelete(
                              warehouse
                            )
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