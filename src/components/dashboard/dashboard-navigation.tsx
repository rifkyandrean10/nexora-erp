"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationGroup } from "./navigation";

type DashboardNavigationProps = {
  groups: NavigationGroup[];
  onNavigate: () => void;
};

export function DashboardNavigation({
  groups,
  onNavigate,
}: DashboardNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-5">
      {groups.map((group) => (
        <div key={group.label} className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {group.label}
          </p>

          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`
                    block rounded-lg px-3 py-2.5
                    text-sm font-medium
                    transition
                    ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}