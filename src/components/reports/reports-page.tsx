"use client";

type ReportSummary = {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalRevenues: number;
  totalInflow: number;
  totalOutflow: number;
  netProfit: number;
  netCashFlow: number;
  inventoryValuation: number;
};

type ReportsPageProps = {
  summary: ReportSummary;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export function ReportsPage({ summary }: ReportsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Laporan ERP Ringkasan
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Analisis ringkas kinerja keuangan, penjualan, pembelian, dan valuasi inventaris Nexora ERP.
        </p>
      </div>

      {/* RANGKUMAN KEUANGAN */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* LABA RUGI */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Laba / Rugi (Kinerja Keuangan)
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Penjualan (Sales)</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(summary.totalSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Pendapatan Lain (Revenue)</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(summary.totalRevenues)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Pembelian (Purchases)</span>
              <span className="font-semibold text-red-600">-{formatCurrency(summary.totalPurchases)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Pengeluaran Operasional (Expenses)</span>
              <span className="font-semibold text-red-600">-{formatCurrency(summary.totalExpenses)}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-bold">
              <span>Keuntungan Bersih (Net Profit)</span>
              <span className={summary.netProfit >= 0 ? "text-slate-950" : "text-amber-600"}>
                {formatCurrency(summary.netProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* CASH FLOW SUMMARY */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Arus Kas (Cash Flow)
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Kas Masuk (Inflow)</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(summary.totalInflow)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Kas Keluar (Outflow)</span>
              <span className="font-semibold text-red-600">-{formatCurrency(summary.totalOutflow)}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-bold">
              <span>Arus Kas Bersih (Net Cash Flow)</span>
              <span className={summary.netCashFlow >= 0 ? "text-slate-950" : "text-amber-600"}>
                {formatCurrency(summary.netCashFlow)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VALUASI INVENTARIS */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-md space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Valuasi Inventaris (Stock Asset Valuation)
        </h2>
        <div className="text-sm space-y-2">
          <p className="text-slate-500">
            Nilai total stok barang yang saat ini tersimpan di seluruh gudang organisasi berdasarkan harga beli (*purchase price*).
          </p>
          <div className="text-3xl font-extrabold text-slate-900 pt-2">
            {formatCurrency(summary.inventoryValuation)}
          </div>
        </div>
      </div>
    </div>
  );
}
