"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationGroup } from "./navigation";

type SidebarProps = {
  navigation: NavigationGroup[];
  mobileOpen: boolean;
  onMobileClose: () => void;
};

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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r bg-white
          transition-transform duration-200
          lg:static lg:z-auto lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <div>
            <h1 className="text-lg font-bold">
              Nexora ERP
            </h1>

            <p className="text-xs text-gray-500">
              Enterprise Resource Planning
            </p>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((group) => (
            <div
              key={group.label}
              className="mb-6"
            >
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(
                      `${item.href}/`
                    );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`
                        flex items-center rounded-lg
                        px-3 py-2.5 text-sm font-medium
                        transition-colors
                        ${
                          isActive
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
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

        {/* Footer */}
        <div className="border-t p-4">
          <p className="text-xs text-gray-400">
            Nexora ERP
          </p>

          <p className="text-xs text-gray-400">
            Enterprise Management System
          </p>
        </div>
      </aside>
    </>
  );
}