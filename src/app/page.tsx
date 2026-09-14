import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  Building2,
  Package,
  ShoppingCart,
  Receipt,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Boxes,
  Zap,
  Sparkles
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">Nexora<span className="text-indigo-400">ERP</span></span>
              <span className="ml-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                v1.0 Enterprise
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  Access Workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-16 text-center lg:pt-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Integrated Enterprise Management System</span>
        </div>

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Empower Your Business Operations with <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Nexora ERP</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Streamline multi-tenant inventories, sales pipelines, supplier procurement, financial accounting, and granular role permissions into one unified real-time dashboard.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={session?.user ? "/dashboard" : "/login"}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:scale-[1.02] hover:shadow-indigo-600/40"
          >
            {session?.user ? "Enter Dashboard" : "Sign In to ERP Workspace"}
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#modules"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 px-8 font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            Explore Modules
          </a>
        </div>

        {/* Feature Badges Bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Multi-Tenant Isolation
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> RBAC Security & Matrix
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Real-time Cash Flow
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Automated Invoicing
          </div>
        </div>
      </section>

      {/* Modules Overview */}
      <section id="modules" className="relative z-10 border-t border-slate-800/80 bg-slate-900/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Complete Module Ecosystem
            </h2>
            <p className="mt-4 text-slate-400">
              Designed to handle every core function of modern commerce and enterprise management.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Inventory */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-indigo-500/50 hover:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Inventory & Warehouses</h3>
              <p className="mt-2 text-sm text-slate-400">
                Track stock balances across multi-warehouse setups with automated stock movement logs.
              </p>
            </div>

            {/* Sales */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-indigo-500/50 hover:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Sales & Customers</h3>
              <p className="mt-2 text-sm text-slate-400">
                Manage customer relationships, sales orders, item pricing, and order fulfillment.
              </p>
            </div>

            {/* Procurement */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-indigo-500/50 hover:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Purchasing & Suppliers</h3>
              <p className="mt-2 text-sm text-slate-400">
                Manage vendor profiles, purchase orders, goods receipt tracking, and item costs.
              </p>
            </div>

            {/* Finance */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-indigo-500/50 hover:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Finance & Invoicing</h3>
              <p className="mt-2 text-sm text-slate-400">
                Generate customer/vendor invoices, track payment status, expenses, and cash flow entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Access Section */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 lg:p-12">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> Enterprise Security Built-In
                </div>
                <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
                  Role-Based Access Control & Multi-Tenant Boundaries
                </h2>
                <p className="mt-4 text-slate-400">
                  Nexora ERP provides custom permission matrices allowing administrators to define fine-grained access for every module and action across your organization.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                      <Zap className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Granular Action Controls</h4>
                      <p className="text-sm text-slate-400">Restricted view, create, edit, and delete rights per user role.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                      <BarChart3 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Audit & Report Insights</h4>
                      <p className="text-sm text-slate-400">Track changes and revenue metrics with instant reporting.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-500">organization_security_matrix.json</span>
                </div>
                <div className="mt-4 space-y-2 font-mono text-xs text-slate-300">
                  <p><span className="text-purple-400">&quot;module&quot;</span>: <span className="text-emerald-400">&quot;INVENTORY&quot;</span>,</p>
                  <p><span className="text-purple-400">&quot;actions&quot;</span>: [<span className="text-emerald-400">&quot;VIEW&quot;</span>, <span className="text-emerald-400">&quot;CREATE&quot;</span>, <span className="text-emerald-400">&quot;EDIT&quot;</span>],</p>
                  <p><span className="text-purple-400">&quot;tenant_isolation&quot;</span>: <span className="text-indigo-400">true</span>,</p>
                  <p><span className="text-purple-400">&quot;status&quot;</span>: <span className="text-emerald-400">&quot;ENFORCED_ACTIVE&quot;</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-12 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Nexora ERP Core Online & Operational</span>
          </div>
          <p>© {new Date().getFullYear()} Nexora ERP System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

