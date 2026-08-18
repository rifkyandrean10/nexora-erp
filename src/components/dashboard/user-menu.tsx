"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

type UserMenuProps = {
  name: string;
  email: string;
};

export function UserMenu({
  name,
  email,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-100"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {initial}
        </div>

        <div className="hidden text-left sm:block">
          <p className="max-w-40 truncate text-sm font-medium text-slate-900">
            {name}
          </p>

          <p className="max-w-40 truncate text-xs text-slate-500">
            {email}
          </p>
        </div>

        <span
          className={`hidden text-xs text-slate-400 transition sm:block ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close user menu"
            className="fixed inset-0 z-40 h-full w-full cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-white shadow-lg"
            role="menu"
          >
            <div className="border-b px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                {name}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {email}
              </p>
            </div>

            <div className="p-1.5">
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                Profile
              </button>

              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                Settings
              </button>
            </div>

            <div className="border-t p-1.5">
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}