"use client";

import { useState } from "react";

import {
  deleteWarehouse,
} from "@/app/actions/warehouse";

import { WarehouseForm } from "./warehouse-form";
import { WarehouseTable } from "./warehouse-table";

export type Warehouse = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string;
  status:
    | "ACTIVE"
    | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
};

type WarehousePageProps = {
  warehouses: Warehouse[];
};

export function WarehousePage({
  warehouses: initialWarehouses,
}: WarehousePageProps) {
  const [
    warehouses,
    setWarehouses,
  ] = useState(initialWarehouses);

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingWarehouse,
    setEditingWarehouse,
  ] = useState<Warehouse | null>(
    null
  );

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  function handleCreated(
    warehouse: Warehouse
  ) {
    setWarehouses((current) => [
      warehouse,
      ...current,
    ]);

    setShowForm(false);
    setEditingWarehouse(null);
    setError("");
  }

  function handleUpdated(
    warehouse: Warehouse
  ) {
    setWarehouses((current) =>
      current.map((item) =>
        item.id === warehouse.id
          ? warehouse
          : item
      )
    );

    setShowForm(false);
    setEditingWarehouse(null);
    setError("");
  }

  function handleEdit(
    warehouse: Warehouse
  ) {
    setError("");
    setEditingWarehouse(warehouse);
    setShowForm(true);
  }

  async function handleDelete(
    warehouse: Warehouse
  ) {
    const confirmed =
      window.confirm(
        `Apakah Anda yakin ingin menghapus warehouse "${warehouse.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeleteLoading(true);

    try {
      const result =
        await deleteWarehouse(
          warehouse.id
        );

      if (!result.success) {
        setError(
          result.message ||
            "Warehouse gagal dihapus."
        );
        return;
      }

      setWarehouses((current) =>
        current.filter(
          (item) =>
            item.id !== warehouse.id
        )
      );

      if (
        editingWarehouse?.id ===
        warehouse.id
      ) {
        setEditingWarehouse(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error(error);

      setError(
        "Terjadi kesalahan saat menghapus warehouse."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleAddWarehouse() {
    setError("");
    setEditingWarehouse(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingWarehouse(null);
    setShowForm(false);
    setError("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Warehouses
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola gudang dan lokasi
            penyimpanan Nexora ERP.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddWarehouse}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Add Warehouse
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingWarehouse
                ? "Edit Warehouse"
                : "Add Warehouse"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingWarehouse
                ? "Perbarui informasi warehouse."
                : "Tambahkan warehouse baru ke organisasi."}
            </p>
          </div>

          <WarehouseForm
            warehouse={
              editingWarehouse
            }
            onCreated={handleCreated}
            onUpdated={handleUpdated}
            onCancel={handleCancel}
          />
        </div>
      )}

      <WarehouseTable
        warehouses={warehouses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deleteLoading={deleteLoading}
      />
    </div>
  );
}