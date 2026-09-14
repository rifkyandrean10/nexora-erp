"use client";

import { useRef, useState, useTransition } from "react";
import { createPayment } from "@/app/actions/payment";

type Invoice = {
  id: string;
  invoiceNumber: string;
  type: "SALE" | "PURCHASE";
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate: string;
  issueDate: string;
  totalAmount: number;
  paidAmount: number;
  sale?: {
    id: string;
    customerId: string;
    customer: {
      name: string;
    };
  } | null;
  purchase?: {
    id: string;
    supplierId: string;
    supplier: {
      name: string;
    };
  } | null;
};

type InvoicePageProps = {
  invoices: Invoice[];
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
  }).format(new Date(value));

export function InvoicePage({ invoices }: InvoicePageProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Payment Form States
  const [paymentNumber, setPaymentNumber] = useState("");
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<"CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "OTHER">("CASH");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const paymentSequence = useRef(0);

  const handleOpenPayModal = (invoice: Invoice) => {
    setPayInvoice(invoice);
    paymentSequence.current += 1;
    setPaymentNumber(`PAY-${invoice.invoiceNumber}-${paymentSequence.current}`);
    setAmount(Number(invoice.totalAmount) - Number(invoice.paidAmount));
    setError("");
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!payInvoice) return;

    if (amount <= 0) {
      setError("Jumlah pembayaran harus lebih besar dari 0.");
      return;
    }

    const maxAllowed = Number(payInvoice.totalAmount) - Number(payInvoice.paidAmount);
    if (amount > maxAllowed) {
      setError(`Jumlah pembayaran melebihi sisa tagihan (${formatCurrency(maxAllowed)}).`);
      return;
    }

    startTransition(async () => {
      const res = await createPayment({
        invoiceId: payInvoice.id,
        paymentNumber,
        paymentDate,
        amount,
        method,
        reference,
        notes,
      });

      if (!res.success) {
        setError(res.message || "Gagal mencatat pembayaran.");
        return;
      }

      setPayInvoice(null);
      // Close other modals if open
      setSelectedInvoice(null);
    });
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesType = typeFilter === "ALL" ? true : inv.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" ? true : inv.status === statusFilter;
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Invoices
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola tagihan Penjualan (Sale Invoice) dan Pembelian (Purchase Invoice).
        </p>
      </div>

      {/* FILTERS */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipe</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:outline-none"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="SALE">Penjualan (Sales)</option>
            <option value="PURCHASE">Pembelian (Purchasing)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="UNPAID">Belum Dibayar (Unpaid)</option>
            <option value="PARTIALLY_PAID">Sebagian (Partially Paid)</option>
            <option value="PAID">Lunas (Paid)</option>
            <option value="OVERDUE">Jatuh Tempo (Overdue)</option>
            <option value="CANCELLED">Batal (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-3">No. Invoice</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Pihak Terkait</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Terbayar</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Jatuh Tempo</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-sm text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    Tidak ada data invoice.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          inv.type === "SALE"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {inv.type === "SALE" ? "Sales" : "Purchase"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.type === "SALE" ? inv.sale?.customer.name : inv.purchase?.supplier.name}
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          inv.status === "UNPAID"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : inv.status === "PARTIALLY_PAID"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : inv.status === "PAID"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                      >
                        Details
                      </button>

                      {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleOpenPayModal(inv)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                        >
                          Record Payment
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
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Detail Invoice</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p><strong>Nomor Invoice:</strong> {selectedInvoice.invoiceNumber}</p>
              <p><strong>Tipe:</strong> {selectedInvoice.type}</p>
              <p>
                <strong>Pihak Terkait:</strong>{" "}
                {selectedInvoice.type === "SALE"
                  ? selectedInvoice.sale?.customer.name
                  : selectedInvoice.purchase?.supplier.name}
              </p>
              <p><strong>Tanggal Terbit:</strong> {formatDate(selectedInvoice.issueDate)}</p>
              <p><strong>Jatuh Tempo:</strong> {formatDate(selectedInvoice.dueDate)}</p>
              <p><strong>Total Tagihan:</strong> {formatCurrency(selectedInvoice.totalAmount)}</p>
              <p><strong>Sudah Dibayar:</strong> {formatCurrency(selectedInvoice.paidAmount)}</p>
              <p>
                <strong>Sisa Tagihan:</strong>{" "}
                <span className="font-semibold text-red-600">
                  {formatCurrency(
                    Number(selectedInvoice.totalAmount) - Number(selectedInvoice.paidAmount)
                  )}
                </span>
              </p>
              <p><strong>Status:</strong> {selectedInvoice.status}</p>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              {selectedInvoice.status !== "PAID" && selectedInvoice.status !== "CANCELLED" && (
                <button
                  onClick={() => handleOpenPayModal(selectedInvoice)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Bayar Sekarang
                </button>
              )}
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {payInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleRecordPaymentSubmit}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
              <button
                type="button"
                onClick={() => setPayInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                Membayar Invoice <strong>{payInvoice.invoiceNumber}</strong>. Sisa tagihan:{" "}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(
                    Number(payInvoice.totalAmount) - Number(payInvoice.paidAmount)
                  )}
                </span>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">No. Transaksi Pembayaran</label>
                <input
                  type="text"
                  required
                  value={paymentNumber}
                  onChange={(e) => setPaymentNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Tanggal Pembayaran</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Jumlah Bayar (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Metode Pembayaran</label>
                <select
                  value={method}
                  onChange={(e) =>
                    setMethod(e.target.value as "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "OTHER")
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="CASH">CASH</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="CREDIT_CARD">CREDIT CARD</option>
                  <option value="OTHER">LAINNYA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Referensi (Bank/Check No.)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Keterangan / Catatan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setPayInvoice(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isPending ? "Mencatat..." : "Simpan Pembayaran"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
