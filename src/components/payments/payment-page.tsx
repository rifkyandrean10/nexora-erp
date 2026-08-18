"use client";

import { useState } from "react";

type Payment = {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  method: "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "OTHER";
  reference: string | null;
  notes: string | null;
  createdAt: string;
  invoice: {
    invoiceNumber: string;
    type: string;
  };
};

type PaymentPageProps = {
  payments: Payment[];
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

export function PaymentPage({ payments }: PaymentPageProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Riwayat Pembayaran
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Catatan riwayat transaksi pelunasan invoice (Masuk & Keluar).
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-3">No. Transaksi</th>
                <th className="px-6 py-3">No. Invoice</th>
                <th className="px-6 py-3">Tipe Invoice</th>
                <th className="px-6 py-3">Jumlah Bayar</th>
                <th className="px-6 py-3">Metode</th>
                <th className="px-6 py-3">Tanggal Bayar</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-sm text-slate-700">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Belum ada riwayat pembayaran yang tercatat.
                  </td>
                </tr>
              ) : (
                payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-950">{pay.paymentNumber}</td>
                    <td className="px-6 py-4 font-medium">{pay.invoice.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          pay.invoice.type === "SALE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {pay.invoice.type === "SALE" ? "KAS MASUK (Sales)" : "KAS KELUAR (Purchasing)"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(pay.amount)}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{pay.method}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(pay.paymentDate)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(pay)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Detail Transaksi Pembayaran</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p><strong>No. Pembayaran:</strong> {selectedPayment.paymentNumber}</p>
              <p><strong>No. Invoice Terkait:</strong> {selectedPayment.invoice.invoiceNumber}</p>
              <p><strong>Jumlah Pembayaran:</strong> {formatCurrency(selectedPayment.amount)}</p>
              <p><strong>Metode Pembayaran:</strong> {selectedPayment.method}</p>
              <p><strong>Tanggal Bayar:</strong> {formatDate(selectedPayment.paymentDate)}</p>
              <p><strong>Referensi Transaksi:</strong> {selectedPayment.reference || "-"}</p>
              <p><strong>Catatan:</strong> {selectedPayment.notes || "-"}</p>
              <p><strong>Diinput Pada:</strong> {formatDate(selectedPayment.createdAt)}</p>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
