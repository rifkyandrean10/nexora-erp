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

type CategoryTableProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => Promise<void>;
  deleteLoading: boolean;
};

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  deleteLoading,
}: CategoryTableProps) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return categories;
    }

    return categories.filter((category) =>
      [
        category.name,
        category.description ?? "",
        category.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [categories, search]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Search */}
      <div className="border-b border-slate-200 p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari kategori..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Kategori
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
            {filteredCategories.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  {search
                    ? "Tidak ada kategori yang sesuai dengan pencarian."
                    : "Belum ada kategori."}
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b last:border-0 hover:bg-slate-50/50"
                >
                  {/* Name */}
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">
                      {category.name}
                    </div>
                  </td>

                  {/* Description */}
                  <td className="max-w-md px-4 py-4 text-slate-500">
                    <div className="line-clamp-2">
                      {category.description || "-"}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    <span
                      className={
                        category.status === "ACTIVE"
                          ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {category.status === "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        disabled={deleteLoading}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        disabled={deleteLoading}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deleteLoading ? "Deleting..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}