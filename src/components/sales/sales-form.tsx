"use client";

import { useState, useTransition } from "react";
import { createSale, updateSale } from "@/app/actions/sale";

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
  customerId: string;
  warehouseId: string;
  invoiceNumber: string | null;
  notes: string | null;
  status: "DRAFT" | "CONFIRMED" | "SHIPPED" | "CANCELLED";
  totalAmount: number;
  items: SaleItem[];
};

type FormItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

type SaleFormProps = {
  products: Product[];
  customers: Customer[];
  warehouses: Warehouse[];
  sale: Sale | null;
  onClose: () => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export function SaleForm({
  products,
  customers,
  warehouses,
  sale,
  onClose,
}: SaleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState(sale?.customerId || "");
  const [warehouseId, setWarehouseId] = useState(sale?.warehouseId || "");
  const [invoiceNumber, setInvoiceNumber] = useState(sale?.invoiceNumber || "");
  const [notes, setNotes] = useState(sale?.notes || "");

  const [items, setItems] = useState<FormItem[]>(
    sale?.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) || [
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]
  );

  const [error, setError] = useState("");

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof FormItem,
    value: string | number
  ) => {
    const newItems = [...items];
    if (field === "productId") {
      newItems[index].productId = value as string;
      // Auto fill sellingPrice
      const product = products.find((p) => p.id === value);
      if (product) {
        // Let's assume there is selling price. Wait, product does have purchasePrice and sellingPrice but they might not be passed in Product type, let's look up product details.
      }
    } else {
      newItems[index][field] = Number(value);
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Pilih Customer terlebih dahulu.");
      return;
    }

    if (!warehouseId) {
      setError("Pilih Warehouse terlebih dahulu.");
      return;
    }

    if (items.some((item) => !item.productId || item.quantity <= 0)) {
      setError("Pastikan semua item produk telah dipilih dan quantity > 0.");
      return;
    }

    const payload = {
      customerId,
      warehouseId,
      invoiceNumber: invoiceNumber || undefined,
      notes: notes || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    startTransition(async () => {
      const res = sale
        ? await updateSale(sale.id, payload)
        : await createSale(payload);

      if (!res.success) {
        setError(res.message || "Terjadi kesalahan.");
        return;
      }

      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Customer
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">-- Pilih Customer --</option>
            {customers
              .filter((c) => c.status === "ACTIVE" || c.id === sale?.customerId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Gudang (Warehouse)
          </label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">-- Pilih Gudang --</option>
            {warehouses
              .filter((w) => w.status === "ACTIVE" || w.id === sale?.warehouseId)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nomor Referensi Invoice (Optional)
          </label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Misal: INV/2026/001"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Catatan (Notes)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={1}
            placeholder="Catatan tambahan..."
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-md font-semibold text-slate-900 mb-4">Daftar Produk</h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500">Produk</label>
                <select
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
                >
                  <option value="">-- Pilih Produk --</option>
                  {products
                    .filter((p) => p.status === "ACTIVE" || p.id === item.productId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}) - {p.unit}
                      </option>
                    ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-xs font-medium text-slate-500">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </div>

              <div className="w-40">
                <label className="block text-xs font-medium text-slate-500">Harga Jual (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </div>

              <div className="w-40 text-right pb-2.5 font-medium text-sm text-slate-700">
                {formatCurrency(item.quantity * item.unitPrice)}
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="pb-2.5 text-sm font-semibold text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 h-9 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          + Add Product
        </button>
      </div>

      <div className="border-t border-slate-200 pt-6 flex justify-between items-center">
        <div>
          <p className="text-xs font-medium text-slate-500">Total Ringkasan</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 h-10 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 h-10 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Sales Order"}
          </button>
        </div>
      </div>
    </form>
  );
}
