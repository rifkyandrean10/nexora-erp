"use client";

import { useState } from "react";

import type { Customer } from "@prisma/client";

import { deleteCustomer } from "@/app/actions/customer";

import { CustomerForm } from "./customer-form";
import { CustomerTable } from "./customer-table";

type CustomerPageProps = {
  customers: Customer[];
};

export function CustomerPage({
  customers: initialCustomers,
}: CustomerPageProps) {
  const [customers, setCustomers] =
    useState<Customer[]>(initialCustomers);

  /**
   * Customer yang sedang diedit.
   *
   * null = mode create
   * Customer = mode edit
   */
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  /**
   * Menampilkan / menyembunyikan form.
   */
  const [showForm, setShowForm] =
    useState(false);

  /**
   * Loading delete.
   */
  const [deleteLoading, setDeleteLoading] =
    useState(false);

  /**
   * Error umum dari delete.
   */
  const [deleteError, setDeleteError] =
    useState("");

  /**
   * =========================================================
   * CREATE
   * =========================================================
   */
  function handleCreated(customer: Customer) {
    setCustomers((current) => [
      customer,
      ...current,
    ]);

    setEditingCustomer(null);
    setShowForm(false);
    setDeleteError("");
  }

  /**
   * =========================================================
   * EDIT
   * =========================================================
   */
  function handleEdit(customer: Customer) {
    setEditingCustomer(customer);
    setShowForm(true);
    setDeleteError("");

    /**
     * Scroll ke form agar customer yang dipilih
     * langsung terlihat.
     */
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /**
   * =========================================================
   * UPDATE
   * =========================================================
   */
  function handleUpdated(updatedCustomer: Customer) {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === updatedCustomer.id
          ? updatedCustomer
          : customer
      )
    );

    setEditingCustomer(null);
    setShowForm(false);
    setDeleteError("");
  }

  /**
   * =========================================================
   * CANCEL FORM
   * =========================================================
   */
  function handleCancel() {
    setEditingCustomer(null);
    setShowForm(false);
    setDeleteError("");
  }

  /**
   * =========================================================
   * ADD CUSTOMER
   * =========================================================
   */
  function handleAddCustomer() {
    setEditingCustomer(null);
    setShowForm(true);
    setDeleteError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /**
   * =========================================================
   * DELETE
   * =========================================================
   */
  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus customer "${customer.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const result =
        await deleteCustomer(customer.id);

      if (!result.success) {
        setDeleteError(
          result.message ||
            "Customer gagal dihapus."
        );

        return;
      }

      /**
       * Hapus customer dari state lokal
       * sehingga tabel langsung berubah
       * tanpa reload halaman.
       */
      setCustomers((current) =>
        current.filter(
          (item) =>
            item.id !== customer.id
        )
      );

      /**
       * Jika customer yang dihapus sedang
       * dalam mode edit, tutup form.
       */
      if (
        editingCustomer?.id === customer.id
      ) {
        setEditingCustomer(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error(
        "DELETE CUSTOMER ERROR:",
        error
      );

      setDeleteError(
        "Terjadi kesalahan saat menghapus customer."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  const isEditMode =
    editingCustomer !== null;

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola data customer Nexora ERP.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCustomer}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {showForm && !isEditMode
            ? "Cancel"
            : "+ Add Customer"}
        </button>
      </div>

      {/* =====================================================
          DELETE ERROR
      ====================================================== */}
      {deleteError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      {/* =====================================================
          CUSTOMER FORM
      ====================================================== */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditMode
                ? "Edit Customer"
                : "Add Customer"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? `Perbarui informasi ${editingCustomer?.name}.`
                : "Tambahkan customer baru ke organisasi."}
            </p>
          </div>

          <CustomerForm
            customer={editingCustomer}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* =====================================================
          CUSTOMER TABLE
      ====================================================== */}
      <CustomerTable
        customers={customers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deleteLoading={deleteLoading}
      />
    </div>
  );
}