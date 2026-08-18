"use client";

import { useState, useTransition } from "react";
import { createExpense, deleteExpense } from "@/app/actions/finance";

type Expense = {
  id: string;
  expenseNumber: string;
  date: string;
  category: string;
  amount: number;
  notes: string | null;
  createdAt: string;
};

type ExpensePageProps = {
  expenses: Expense[];
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

export function ExpensePage({ expenses }: ExpensePageProps) {
  const [showForm, setShowForm] = useState(false);
  const [expenseNumber, setExpenseNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleOpenForm = () => {
    setExpenseNumber(`EXP-${Date.now().toString().slice(-8)}`);
    setCategory("");
    setAmount(0);
    setNotes("");
    setError("");
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (amount <= 0) {
      setError("Jumlah pengeluaran harus lebih besar dari 0.");
      return;
    }

    if (!category) {
      setError("Kategori wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await createExpense({
        expenseNumber,
        date,
        category,
        amount,
        notes,
      });

      if (!res.success) {
        setError(res.message || "Gagal menyimpan pengeluaran.");
        return;
      }

      setShowForm(false);
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan pengeluaran ini?")) return;
    startTransition(async () => {
      const res = await deleteExpense(id);
      if (!res.success) alert(res.message);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Expenses (Pengeluaran)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Catat dan pantau pengeluaran operasional organisasi Anda.
          </p>
        </div>

        <button
          onClick={handleOpenForm}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Record Expense
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Record New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">No. Pengeluaran</label>
                <input
                  type="text"
                  required
                  value={expenseNumber}
                  onChange={(e) => setExpenseNumber(e.target.value)}
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
                <label className="block text-xs font-semibold text-slate-500 uppercase">Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Listrik, Gaji, Sewa Gedung"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Jumlah Pengeluaran (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
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
                {isPending ? "Menyimpan..." : "Simpan Pengeluaran"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-3">No. Pengeluaran</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Jumlah (Rp)</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Catatan</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-sm text-slate-700">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    Belum ada catatan pengeluaran.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-950">{exp.expenseNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{exp.category}</td>
                    <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(exp.amount)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(exp.date)}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{exp.notes || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
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
