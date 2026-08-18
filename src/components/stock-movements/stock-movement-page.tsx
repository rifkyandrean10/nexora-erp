"use client";

import { useState } from "react";

import {
  StockMovementForm,
} from "./stock-movement-form";

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

type StockMovement = {
  id: string;
  organizationId: string;
  productId: string;
  warehouseId: string;

  type:
    | "IN"
    | "OUT"
    | "ADJUSTMENT";

  quantity: number;

  reference: string | null;
  notes: string | null;

  createdAt: Date;

  product: Product;
  warehouse: Warehouse;
};

type StockMovementPageProps = {
  movements: StockMovement[];
  products: Product[];
  warehouses: Warehouse[];
};

export function StockMovementPage({
  movements: initialMovements,
  products,
  warehouses,
}: StockMovementPageProps) {
  const [
    movements,
    setMovements,
  ] = useState(initialMovements);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  function handleCreated(
    movement: StockMovement
  ) {
    setMovements((current) => [
      movement,
      ...current,
    ]);

    setShowForm(false);
    setError("");
  }

  function handleAddMovement() {
    setError("");
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setError("");
  }

  function formatQuantity(
    quantity: number
  ) {
    return new Intl.NumberFormat(
      "id-ID",
      {
        maximumFractionDigits: 2,
      }
    ).format(quantity);
  }

  function formatDate(
    date: Date
  ) {
    return new Intl.DateTimeFormat(
      "id-ID",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(date));
  }

  function getTypeLabel(
    type: StockMovement["type"]
  ) {
    switch (type) {
      case "IN":
        return "Stock In";

      case "OUT":
        return "Stock Out";

      case "ADJUSTMENT":
        return "Adjustment";

      default:
        return type;
    }
  }

  function getTypeClass(
    type: StockMovement["type"]
  ) {
    switch (type) {
      case "IN":
        return "bg-emerald-50 text-emerald-700";

      case "OUT":
        return "bg-red-50 text-red-700";

      case "ADJUSTMENT":
        return "bg-amber-50 text-amber-700";

      default:
        return "bg-slate-50 text-slate-700";
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Stock Movements
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola dan pantau riwayat
            perubahan stok.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleAddMovement
          }
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Add Movement
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Add Stock Movement
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Catat perubahan stok
              produk pada warehouse.
            </p>
          </div>

          <StockMovementForm
            products={products}
            warehouses={warehouses}
            onCreated={
              handleCreated
            }
            onCancel={
              handleCancel
            }
          />
        </div>
      )}

      {/* EMPTY STATE */}
      {movements.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Belum ada stock movement
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Belum terdapat riwayat
            perubahan stok.
          </p>
        </div>
      ) : (
        /* TABLE */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-700">
                    Date
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-700">
                    Product
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-700">
                    Warehouse
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-700">
                    Type
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-700">
                    Quantity
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-700">
                    Reference
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-700">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {movements.map(
                  (movement) => (
                    <tr
                      key={
                        movement.id
                      }
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(
                          movement.createdAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {
                            movement
                              .product
                              .name
                          }
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          {
                            movement
                              .product
                              .code
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {
                            movement
                              .warehouse
                              .name
                          }
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          {
                            movement
                              .warehouse
                              .code
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getTypeClass(
                            movement.type
                          )}`}
                        >
                          {getTypeLabel(
                            movement.type
                          )}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                        {formatQuantity(
                          movement.quantity
                        )}{" "}
                        {
                          movement
                            .product
                            .unit
                        }
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {movement.reference ||
                          "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        {movement.notes ||
                          "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}