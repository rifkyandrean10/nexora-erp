"use client";

import { useMemo, useState } from "react";

type Product = {
  id: string;
  code: string;
  name: string;
  unit: string;
  status: "ACTIVE" | "INACTIVE";
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

type Inventory = {
  id: string;
  organizationId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  warehouse: Warehouse;
};

type InventoryTableProps = {
  inventories: Inventory[];
  onEdit: (inventory: Inventory) => void;
};

export function InventoryTable({
  inventories,
  onEdit,
}: InventoryTableProps) {
  const [search, setSearch] =
    useState("");

  const [
    warehouseFilter,
    setWarehouseFilter,
  ] = useState("");

  const filteredInventories =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      return inventories.filter(
        (inventory) => {
          const matchesSearch =
            !keyword ||
            [
              inventory.product.code,
              inventory.product.name,
              inventory.warehouse.code,
              inventory.warehouse.name,
            ]
              .join(" ")
              .toLowerCase()
              .includes(keyword);

          const matchesWarehouse =
            !warehouseFilter ||
            inventory.warehouseId ===
              warehouseFilter;

          return (
            matchesSearch &&
            matchesWarehouse
          );
        }
      );
    }, [
      inventories,
      search,
      warehouseFilter,
    ]);

  const warehouses = useMemo(() => {
    const map = new Map<
      string,
      Warehouse
    >();

    inventories.forEach(
      (inventory) => {
        map.set(
          inventory.warehouse.id,
          inventory.warehouse
        );
      }
    );

    return Array.from(map.values()).sort(
      (a, b) =>
        a.name.localeCompare(b.name)
    );
  }, [inventories]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* FILTERS */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Cari produk atau gudang..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:max-w-sm"
        />

        <select
          value={warehouseFilter}
          onChange={(event) =>
            setWarehouseFilter(
              event.target.value
            )
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:max-w-xs"
        >
          <option value="">
            Semua Gudang
          </option>

          {warehouses.map(
            (warehouse) => (
              <option
                key={warehouse.id}
                value={warehouse.id}
              >
                {warehouse.name}
              </option>
            )
          )}
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Produk
              </th>

              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Gudang
              </th>

              <th className="px-4 py-3 text-right font-medium text-slate-700">
                Quantity
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
            {filteredInventories.length ===
            0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Tidak ada inventory
                  ditemukan.
                </td>
              </tr>
            ) : (
              filteredInventories.map(
                (inventory) => {
                  const isOutOfStock =
                    inventory.quantity ===
                    0;

                  return (
                    <tr
                      key={inventory.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {
                            inventory.product
                              .name
                          }
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {
                            inventory.product
                              .code
                          }
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {
                            inventory.warehouse
                              .name
                          }
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {
                            inventory.warehouse
                              .code
                          }
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-slate-900">
                          {inventory.quantity.toLocaleString(
                            "id-ID",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>

                        <span className="ml-1 text-xs text-slate-500">
                          {
                            inventory.product
                              .unit
                          }
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span
                          className={
                            isOutOfStock
                              ? "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                              : "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                          }
                        >
                          {isOutOfStock
                            ? "OUT OF STOCK"
                            : "IN STOCK"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(
                                inventory
                              )
                            }
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}