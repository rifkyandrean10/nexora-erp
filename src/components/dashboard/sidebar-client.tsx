"use client";

import Link from "next/link";

import type { NavigationGroup } from "./navigation";
import { DashboardNavigation } from "./dashboard-navigation";

type SidebarClientProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  navigation: NavigationGroup[];
};

export function SidebarClient({
  mobileOpen,
  onMobileClose,
  navigation,
}: SidebarClientProps) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex w-64 flex-col
        border-r border-slate-200
        bg-white
        transition-transform duration-200
        ease-in-out
        lg:translate-x-0
        ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          Nexora ERP
        </Link>

        <button
          type="button"
          onClick={onMobileClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      <DashboardNavigation
        groups={navigation}
        onNavigate={onMobileClose}
      />

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            N
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              Nexora ERP
            </p>

            <p className="truncate text-xs text-slate-500">
              Enterprise Resource Planning
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}