"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import type { NavigationGroup } from "./navigation";
import { Sidebar } from "./sidebar";
import { Menu, LogOut, Building, Bell, Search, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
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
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 lg:px-6">
            {/* Left Header Section */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <Building className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Nexora ERP Portal</span>
                </div>
              </div>
            </div>

            {/* Right Header Section */}
            <div className="ml-auto flex items-center gap-3">
              {/* Notification Icon */}
              <button
                type="button"
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              {/* User Avatar & Info */}
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {displayEmail}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-600/20">
                  {initial}
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() =>
                    signOut({
                      callbackUrl: "/login",
                    })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  title="Sign out of workspace"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}