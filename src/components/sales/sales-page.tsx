"use client";

import { useState, useTransition } from "react";
import { confirmSale, deleteSale, shipSale } from "@/app/actions/sale";
import { SaleForm } from "./sales-form";

type Product = {
  id: string;
  code: string;
  name: string;
  unit: string;
  status: "ACTIVE" | "INACTIVE";
};

type Customer = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

type SaleItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
};

type Sale = {
  id: string;
  organizationId: string;
  customerId: string;
  warehouseId: string;
  invoiceNumber: string | null;
  notes: string | null;
  status: "DRAFT" | "CONFIRMED" | "SHIPPED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  warehouse: Warehouse;
  items: SaleItem[];
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
  } | null;
};

type SalesPageProps = {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  warehouses: Warehouse[];
};

const statusLabels = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function SalesPage({
  sales,
  products,
  customers,
  warehouses,
}: SalesPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const filteredSales =
    statusFilter === "ALL"
      ? sales
      : sales.filter((s) => s.status === statusFilter);

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus penjualan ini?")) return;
    startTransition(async () => {
      await deleteSale(id);
    });
  };

  const handleConfirm = (id: string) => {
    if (!window.confirm("Konfirmasi penjualan ini? Invoice akan diterbitkan.")) return;
    startTransition(async () => {
      const res = await confirmSale(id);
      if (!res.success) alert(res.message);
    });
  };

  const handleShip = (id: string) => {
    if (!window.confirm("Kirim barang untuk penjualan ini? Stok gudang akan terpotong.")) return;
    startTransition(async () => {
      const res = await shipSale(id);
      if (!res.success) alert(res.message);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sales Order
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola transaksi penjualan barang ke customer.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSale(null);
            setShowForm(!showForm);
          }}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {showForm ? "Cancel" : "+ New Sales Order"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">
            {editingSale ? "Edit Sales Order" : "New Sales Order"}
          </h2>
          <SaleForm
            products={products}
            customers={customers}
            warehouses={warehouses}
            sale={editingSale}
            onClose={() => {
              setShowForm(false);
              setEditingSale(null);
            }}
          />
        </div>
      )}

      {/* FILTER & TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
          <span className="text-sm font-medium text-slate-500">Filter Status:</span>
          {["ALL", "DRAFT", "CONFIRMED", "SHIPPED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status === "ALL" ? "Semua" : statusLabels[status as keyof typeof statusLabels]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Warehouse</th>
                <th className="px-6 py-3">Ref Invoice</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-sm text-slate-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Tidak ada data penjualan.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">
                      {sale.customer.name}
                    </td>
                    <td className="px-6 py-4">{sale.warehouse.name}</td>
                    <td className="px-6 py-4">{sale.invoiceNumber || "-"}</td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(sale.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          sale.status === "DRAFT"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : sale.status === "CONFIRMED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : sale.status === "SHIPPED"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {statusLabels[sale.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{formatDate(sale.createdAt)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                      >
                        Details
                      </button>

                      {sale.status === "DRAFT" && (
                        <>
                          <button
                            onClick={() => handleEdit(sale)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleConfirm(sale.id)}
                            className="text-xs font-semibold text-green-600 hover:text-green-800"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {sale.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleShip(sale.id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Ship Items
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Detail Sales Order</h3>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-800">Customer:</p>
                <p>{selectedSale.customer.name} ({selectedSale.customer.code})</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Warehouse:</p>
                <p>{selectedSale.warehouse.name} ({selectedSale.warehouse.code})</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Status:</p>
                <p>{statusLabels[selectedSale.status]}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Ref Invoice / Catatan:</p>
                <p>{selectedSale.invoiceNumber || "-"} / {selectedSale.notes || "-"}</p>
              </div>
              {selectedSale.invoice && (
                <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800">Invoice Terkait:</p>
                    <p className="text-xs">{selectedSale.invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{formatCurrency(selectedSale.invoice.totalAmount)}</p>
                    <p className="text-xs font-medium text-slate-500">Status: {selectedSale.invoice.status}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-sm text-slate-900 mb-2">Item Barang</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 font-medium">
                    <tr>
                      <th className="px-4 py-2">Produk</th>
                      <th className="px-4 py-2">Qty</th>
                      <th className="px-4 py-2">Harga Unit</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSale.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 font-medium text-slate-800">
                          {item.product.name}
                        </td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold text-slate-800">
                      <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(selectedSale.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSale(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
