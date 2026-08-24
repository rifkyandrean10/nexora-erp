"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Boxes, Mail, Lock, AlertCircle, ArrowRight, Shield, CheckCircle2, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .email("Email tidak valid"),

  password: z
    .string()
    .min(1, "Password wajib diisi"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError("");

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (!result?.ok) {
      setServerError("Email atau password salah. Silakan periksa kembali akun Anda.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-100">
      {/* Left Pane - Branding Showcase (Desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-slate-800 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-12 lg:flex">
        {/* Background glow */}
        <div className="absolute top-1/4 left-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-purple-500/15 blur-[90px]" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
            <Boxes className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-white">Nexora<span className="text-indigo-400">ERP</span></span>
            <p className="text-xs text-slate-400">Enterprise Resource Planning Platform</p>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Shield className="h-3.5 w-3.5 text-indigo-400" /> Multi-Tenant Authorization Engine
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Streamline your enterprise operations in one unified workspace.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Manage inventory across multiple warehouses, sales pipelines, supplier purchases, and financial cash flows with end-to-end security.
          </p>

          <div className="space-y-3 pt-4 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Real-time stock movements & inventory adjustments</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Role-based granular action permissions (RBAC)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Financial tracking, expenses, invoices, & cash flow</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          <span>© {new Date().getFullYear()} Nexora ERP Inc.</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            System Secure & Active
          </span>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo Header */}
          <div className="flex items-center gap-3 lg:hidden justify-center mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">Nexora<span className="text-indigo-400">ERP</span></span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter your credentials to access your Nexora organization dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="admin@nexora.local"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Hint */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">Demo Access Credentials:</p>
            <p className="font-mono text-slate-400">Email: <span className="text-indigo-300">admin@nexora.local</span></p>
            <p className="font-mono text-slate-400">Password: <span className="text-indigo-300">password123</span></p>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition">
              ← Return to Main Page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}