"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

import type { NavigationGroup } from "./navigation";
import { Sidebar } from "./sidebar";

type DashboardUser = {
  name: string;
  email: string;
};

type DashboardShellProps = {
  children: React.ReactNode;
  navigation: NavigationGroup[];
  user: DashboardUser;
};

export function DashboardShell({
  children,
  navigation,
  user,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user.name || "User";
  const displayEmail = user.email || "-";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          navigation={navigation}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        {/* Main Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Open sidebar"
            >
              ☰
            </button>

            {/* Desktop Header Title */}
            <div className="hidden lg:block">
              <h2 className="text-sm font-semibold text-gray-800">
                Nexora ERP
              </h2>
            </div>

            {/* User Area */}
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-800">
                  {displayName}
                </p>

                <p className="text-xs text-gray-500">
                  {displayEmail}
                </p>
              </div>

              {/* Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                {initial}
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                  })
                }
                className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}