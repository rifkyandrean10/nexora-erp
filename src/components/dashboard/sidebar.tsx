"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationGroup } from "./navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Layers,
  Package,
  Warehouse,
  Boxes,
  ArrowLeftRight,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
  Coins,
  BarChart3,
  UserCheck,
  Shield,
  KeyRound,
  X
} from "lucide-react";

type SidebarProps = {
  navigation: NavigationGroup[];
  mobileOpen: boolean;
  onMobileClose: () => void;
};

// Helper function to map routes to Lucide Icons
function getNavIcon(href: string) {
  switch (href) {
    case "/dashboard":
      return LayoutDashboard;
    case "/dashboard/customers":
      return Users;
    case "/dashboard/suppliers":
      return Building2;
    case "/dashboard/categories":
      return Layers;
    case "/dashboard/products":
      return Package;
    case "/dashboard/warehouses":
      return Warehouse;
    case "/dashboard/inventory":
      return Boxes;
    case "/dashboard/stock-movements":
      return ArrowLeftRight;
    case "/dashboard/purchasing":
      return ShoppingBag;
    case "/dashboard/sales":
      return ShoppingCart;
    case "/dashboard/invoices":
      return Receipt;
    case "/dashboard/payments":
      return CreditCard;
    case "/dashboard/expenses":
      return ArrowUpRight;
    case "/dashboard/revenue":
      return TrendingUp;
    case "/dashboard/cash-flow":
      return Coins;
    case "/dashboard/reports":
      return BarChart3;
    case "/dashboard/users":
      return UserCheck;
    case "/dashboard/roles":
      return Shield;
    case "/dashboard/permissions":
      return KeyRound;
    default:
      return LayoutDashboard;
  }
}

export function Sidebar({
  navigation,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900
          transition-transform duration-200 ease-in-out
          lg:static lg:z-auto lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-500/20 text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Nexora<span className="text-indigo-600 dark:text-indigo-400">ERP</span>
              </h1>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Enterprise Management
              </p>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navigation.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = getNavIcon(item.href);
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`
                        flex items-center gap-3 rounded-lg
                        px-3 py-2 text-xs font-semibold
                        transition-all duration-150
                        ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                        }
                      `}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-50/50 p-2.5 dark:bg-indigo-950/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <div className="text-[11px]">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Nexora Multi-Tenant</p>
              <p className="text-slate-500 dark:text-slate-400">Org Boundary Active</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}