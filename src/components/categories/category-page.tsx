"use client";

import { useState } from "react";

import { deleteCategory } from "@/app/actions/category";

import { CategoryForm } from "./category-form";
import { CategoryTable } from "./category-table";

type Category = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
};

type CategoryPageProps = {
  categories: Category[];
};

function sortCategories(categories: Category[]) {
  return [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, "id")
  );
}

export function CategoryPage({
  categories: initialCategories,
}: CategoryPageProps) {
  const [categories, setCategories] = useState<Category[]>(
    sortCategories(initialCategories)
  );

  const [showForm, setShowForm] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [error, setError] = useState("");

  function handleCreated(category: Category) {
    setCategories((current) =>
      sortCategories([...current, category])
    );

    setShowForm(false);
    setEditingCategory(null);
    setError("");
  }

  function handleUpdated(category: Category) {
    setCategories((current) =>
      sortCategories(
        current.map((item) =>
          item.id === category.id ? category : item
        )
      )
    );

    setShowForm(false);
    setEditingCategory(null);
    setError("");
  }

  function handleEdit(category: Category) {
    setError("");
    setEditingCategory(category);
    setShowForm(true);
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeleteLoading(true);

    try {
      const result = await deleteCategory(category.id);

      if (!result.success) {
        setError(
          result.message || "Kategori gagal dihapus."
        );
        return;
      }

      setCategories((current) =>
        current.filter((item) => item.id !== category.id)
      );

      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error(error);

      setError(
        "Terjadi kesalahan saat menghapus kategori."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleAddCategory() {
    setError("");
    setEditingCategory(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingCategory(null);
    setShowForm(false);
    setError("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola kategori produk Nexora ERP.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCategory}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {showForm ? "+ New Category" : "+ Add Category"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingCategory
                ? "Edit Category"
                : "Add Category"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingCategory
                ? "Perbarui informasi kategori."
                : "Tambahkan kategori baru ke organisasi."}
            </p>
          </div>

          <CategoryForm
            category={editingCategory}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Table */}
      <CategoryTable
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deleteLoading={deleteLoading}
      />
    </div>
  );
}