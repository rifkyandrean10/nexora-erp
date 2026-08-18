"use client";

import { useState, useTransition } from "react";
import { createCashFlow } from "@/app/actions/finance";

type CashFlow = {
  id: string;
  entryNumber: string;
  date: string;
  type: "INFLOW" | "OUTFLOW";
  amount: number;
  category: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
};

type CashFlowPageProps = {
  cashFlows: CashFlow[];
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

export function CashFlowPage({ cashFlows }: CashFlowPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [entryNumber, setEntryNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"INFLOW" | "OUTFLOW">("INFLOW");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");

  const handleOpenForm = () => {
    setEntryNumber(`CF-M-${Date.now().toString().slice(-8)}`);
    setCategory("");
    setAmount(0);
    setReference("");
    setNotes("");
    setError("");
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (amount <= 0) {
      setError("Jumlah arus kas harus lebih besar dari 0.");
      return;
    }

    if (!category) {
      setError("Kategori wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await createCashFlow({
        entryNumber,
        date,
        type,
        amount,
        category,
        reference: reference || undefined,
        notes: notes || undefined,
      });

      if (!res.success) {
        setError(res.message || "Gagal mencatat arus kas.");
        return;
      }

      setShowForm(false);
    });
  };

  // Filtered Cash Flows
  const filteredCashFlows = cashFlows.filter((cf) => {
    return typeFilter === "ALL" ? true : cf.type === typeFilter;
  });

  // Calculate Net balance
  const totalInflow = cashFlows
    .filter((cf) => cf.type === "INFLOW")
    .reduce((sum, cf) => sum + Number(cf.amount), 0);

  const totalOutflow = cashFlows
    .filter((cf) => cf.type === "OUTFLOW")
    .reduce((sum, cf) => sum + Number(cf.amount), 0);

  const netBalance = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Cash Flow (Arus Kas)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau dan catat seluruh mutasi aliran dana kas masuk dan kas keluar organisasi.
          </p>
        </div>

        <button
          onClick={handleOpenForm}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Record Cash Entry
        </button>
      </div>

      {/* SUMMARY WIDGETS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Kas Masuk (Inflow)</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(totalInflow)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Kas Keluar (Outflow)</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(totalOutflow)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Saldo Netto (Net Balance)</p>
          <p className={`mt-2 text-2xl font-bold ${netBalance >= 0 ? "text-slate-950" : "text-amber-600"}`}>
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Record New Cash Flow Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">No. Entri Mutasi</label>
                <input
                  type="text"
                  required
                  value={entryNumber}
                  onChange={(e) => setEntryNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Jenis Arus Kas</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="INFLOW">KAS MASUK (Inflow)</option>
                  <option value="OUTFLOW">KAS KELUAR (Outflow)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Jumlah Saldo (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Modal Usaha, Transfer Bank, Lainnya"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Referensi Dokumen</label>
                <input
                  type="text"
                  placeholder="Optional (Misal: Invoice No.)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Catatan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? "Menyimpan..." : "Simpan Arus Kas"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
          <span className="text-sm font-medium text-slate-500">Filter Tipe:</span>
          {["ALL", "INFLOW", "OUTFLOW"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                typeFilter === t
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t === "ALL" ? "Semua" : t}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-3">No. Entri</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Jumlah (Rp)</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Referensi</th>
                <th className="px-6 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-sm text-slate-700">
              {filteredCashFlows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Belum ada riwayat mutasi arus kas.
                  </td>
                </tr>
              ) : (
                filteredCashFlows.map((cf) => (
                  <tr key={cf.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-950">{cf.entryNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{cf.category}</td>
                    <td
                      className={`px-6 py-4 font-bold ${
                        cf.type === "INFLOW" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {cf.type === "INFLOW" ? "+" : "-"}
                      {formatCurrency(cf.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          cf.type === "INFLOW"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {cf.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(cf.date)}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{cf.reference || "-"}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-xs">{cf.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
