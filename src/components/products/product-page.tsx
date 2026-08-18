"use client";

import { useState } from "react";

import {
  deleteProduct,
} from "@/app/actions/product";

import { ProductForm } from "./product-form";
import { ProductTable } from "./product-table";

type Category = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: string;
  organizationId: string;
  categoryId: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
  category: Category;
};

type ProductPageProps = {
  products: Product[];
  categories: Category[];
};

export function ProductPage({
  products: initialProducts,
  categories,
}: ProductPageProps) {
  const [products, setProducts] =
    useState<Product[]>(
      initialProducts
    );

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(
    null
  );

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  function handleCreated(
    product: Product
  ) {
    setProducts((current) => [
      product,
      ...current,
    ]);

    setShowForm(false);
    setEditingProduct(null);
    setError("");
  }

  function handleUpdated(
    product: Product
  ) {
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? product
          : item
      )
    );

    setShowForm(false);
    setEditingProduct(null);
    setError("");
  }

  function handleEdit(
    product: Product
  ) {
    setError("");
    setEditingProduct(product);
    setShowForm(true);
  }

  async function handleDelete(
    product: Product
  ) {
    const confirmed =
      window.confirm(
        `Apakah Anda yakin ingin menghapus produk "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeleteLoading(true);

    try {
      const result =
        await deleteProduct(
          product.id
        );

      if (!result.success) {
        setError(
          result.message ||
            "Produk gagal dihapus."
        );

        return;
      }

      setProducts((current) =>
        current.filter(
          (item) =>
            item.id !== product.id
        )
      );

      if (
        editingProduct?.id ===
        product.id
      ) {
        setEditingProduct(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error(error);

      setError(
        "Terjadi kesalahan saat menghapus produk."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleAddProduct() {
    setError("");
    setEditingProduct(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingProduct(null);
    setShowForm(false);
    setError("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola produk dan informasi
            produk Nexora ERP.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Add Product
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
              {editingProduct
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingProduct
                ? "Perbarui informasi produk."
                : "Tambahkan produk baru ke organisasi."}
            </p>
          </div>

          <ProductForm
            product={editingProduct}
            categories={categories}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Table */}
      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deleteLoading={deleteLoading}
      />
    </div>
  );
}