"use client";

import { useState } from "react";

import type { Supplier } from "@prisma/client";

import {
  deleteSupplier,
} from "@/app/actions/supplier";

import { SupplierForm } from "./supplier-form";
import { SupplierTable } from "./supplier-table";

type SupplierPageProps = {
  suppliers: Supplier[];
};

export function SupplierPage({
  suppliers: initialSuppliers,
}: SupplierPageProps) {
  const [suppliers, setSuppliers] =
    useState(initialSuppliers);

  const [showForm, setShowForm] =
    useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState<Supplier | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  function handleCreated(supplier: Supplier) {
    setSuppliers((current) => [
      supplier,
      ...current,
    ]);

    setEditingSupplier(null);
    setShowForm(false);
  }

  function handleUpdated(supplier: Supplier) {
    setSuppliers((current) =>
      current.map((item) =>
        item.id === supplier.id
          ? supplier
          : item
      )
    );

    setEditingSupplier(null);
    setShowForm(false);
  }

  function handleEdit(supplier: Supplier) {
    setDeleteError("");
    setEditingSupplier(supplier);
    setShowForm(true);
  }

  async function handleDelete(
    supplier: Supplier
  ) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus supplier "${supplier.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setDeleteLoading(true);

    try {
      const result =
        await deleteSupplier(supplier.id);

      if (!result.success) {
        setDeleteError(
          result.message ||
            "Supplier gagal dihapus."
        );

        return;
      }

      setSuppliers((current) =>
        current.filter(
          (item) => item.id !== supplier.id
        )
      );

      if (
        editingSupplier?.id === supplier.id
      ) {
        setEditingSupplier(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error(error);

      setDeleteError(
        "Terjadi kesalahan saat menghapus supplier."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleAddSupplier() {
    setDeleteError("");
    setEditingSupplier(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingSupplier(null);
    setShowForm(false);
    setDeleteError("");
  }

  const formTitle = editingSupplier
    ? "Edit Supplier"
    : "Add Supplier";

  const formDescription = editingSupplier
    ? "Perbarui informasi supplier."
    : "Tambahkan supplier baru ke organisasi.";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Suppliers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola supplier dan informasi supplier
            Nexora ERP.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSupplier}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {showForm
            ? "+ New Supplier"
            : "+ Add Supplier"}
        </button>
      </div>

      {/* Delete Error */}
      {deleteError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {formTitle}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formDescription}
            </p>
          </div>

          <SupplierForm
            supplier={editingSupplier}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Table */}
      <SupplierTable
        suppliers={suppliers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deleteLoading={deleteLoading}
      />
    </div>
  );
}