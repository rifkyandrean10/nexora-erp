"use client";

import { useState } from "react";

import {
  InventoryForm,
} from "./inventory-form";

import {
  InventoryTable,
} from "./inventory-table";

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

type InventoryPageProps = {
  inventories: Inventory[];
  products: Product[];
  warehouses: Warehouse[];
};

export function InventoryPage({
  inventories: initialInventories,
  products,
  warehouses,
}: InventoryPageProps) {
  const [
    inventories,
    setInventories,
  ] = useState(initialInventories);

  const [showForm, setShowForm] =
    useState(false);

  const [editingInventory, setEditingInventory] =
    useState<Inventory | null>(null);

  const [error, setError] =
    useState("");

  function handleCreated(
    inventory: Inventory
  ) {
    setInventories((current) => {
      const existing = current.find(
        (item) =>
          item.id === inventory.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === inventory.id
            ? inventory
            : item
        );
      }

      return [
        inventory,
        ...current,
      ];
    });

    setShowForm(false);
    setEditingInventory(null);
    setError("");
  }

  function handleUpdated(
    inventory: Inventory
  ) {
    setInventories((current) =>
      current.map((item) =>
        item.id === inventory.id
          ? inventory
          : item
      )
    );

    setShowForm(false);
    setEditingInventory(null);
    setError("");
  }

  function handleEdit(
    inventory: Inventory
  ) {
    setError("");
    setEditingInventory(inventory);
    setShowForm(true);
  }

  function handleAddInventory() {
    setError("");
    setEditingInventory(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingInventory(null);
    setShowForm(false);
    setError("");
  }

  const totalItems =
    inventories.length;

  const totalQuantity =
    inventories.reduce(
      (total, inventory) =>
        total + inventory.quantity,
      0
    );

  const activeProducts =
    new Set(
      inventories
        .filter(
          (inventory) =>
            inventory.product.status ===
            "ACTIVE"
        )
        .map(
          (inventory) =>
            inventory.productId
        )
    ).size;

  const activeWarehouses =
    new Set(
      inventories
        .filter(
          (inventory) =>
            inventory.warehouse.status ===
            "ACTIVE"
        )
        .map(
          (inventory) =>
            inventory.warehouseId
        )
    ).size;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola stok produk di setiap
            gudang Nexora ERP.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddInventory}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Adjust Stock
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Inventory Records"
          value={totalItems.toLocaleString(
            "id-ID"
          )}
        />

        <StatCard
          label="Total Quantity"
          value={totalQuantity.toLocaleString(
            "id-ID"
          )}
        />

        <StatCard
          label="Products"
          value={activeProducts.toLocaleString(
            "id-ID"
          )}
        />

        <StatCard
          label="Warehouses"
          value={activeWarehouses.toLocaleString(
            "id-ID"
          )}
        />
      </div>

      {/* FORM */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingInventory
                ? "Adjust Stock"
                : "Add Inventory"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingInventory
                ? "Perbarui jumlah stok produk."
                : "Tambahkan stok awal produk ke gudang."}
            </p>
          </div>

          <InventoryForm
            inventory={editingInventory}
            products={products}
            warehouses={warehouses}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* TABLE */}
      <InventoryTable
        inventories={inventories}
        onEdit={handleEdit}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}