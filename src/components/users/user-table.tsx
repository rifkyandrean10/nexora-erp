"use client";

import { useMemo, useState } from "react";

import type { ManagedUser } from "./user-page";

type UserTableProps = {
  users: ManagedUser[];
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
  deleteLoading?: boolean;
};

export function UserTable({ users, onEdit, onDelete, deleteLoading = false }: UserTableProps) {
  const [search, setSearch] = useState("");
  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) => [user.name, user.email, user.phone, ...user.roles.map(({ role }) => role.name)].some((value) => value?.toLowerCase().includes(keyword)));
  }, [search, users]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-lg font-semibold text-slate-900">User List</h2><p className="mt-1 text-sm text-slate-500">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</p></div>
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user..." className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:w-80" />
      </div>
      {filteredUsers.length === 0 ? <div className="flex min-h-48 items-center justify-center p-6 text-center"><div><p className="text-sm font-medium text-slate-700">{users.length === 0 ? "Belum ada user." : "User tidak ditemukan."}</p><p className="mt-1 text-sm text-slate-500">{users.length === 0 ? "Tambahkan user pertama untuk organisasi ini." : "Coba gunakan kata kunci pencarian yang berbeda."}</p></div></div> :
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50"><tr className="border-b border-slate-200"><Header>User</Header><Header>Contact</Header><Header>Role</Header><Header>Status</Header><Header>Last Login</Header><th className="px-5 py-3 text-right font-semibold text-slate-600">Actions</th></tr></thead><tbody>{filteredUsers.map((user) => <UserRow key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} deleteLoading={deleteLoading} />)}</tbody></table></div>}
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) { return <th className="px-5 py-3 font-semibold text-slate-600">{children}</th>; }

function UserRow({ user, onEdit, onDelete, deleteLoading }: { user: ManagedUser; onEdit: (user: ManagedUser) => void; onDelete: (user: ManagedUser) => void; deleteLoading: boolean }) {
  return <tr className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"><td className="px-5 py-4"><p className="font-medium text-slate-900">{user.name}</p><p className="mt-1 text-xs text-slate-400">Joined {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(user.createdAt))}</p></td><td className="px-5 py-4"><p className="text-slate-700">{user.email}</p><p className="mt-1 text-xs text-slate-500">{user.phone || "No phone"}</p></td><td className="px-5 py-4"><div className="flex flex-wrap gap-1">{user.roles.length ? user.roles.map(({ role }) => <span key={role.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{role.name}</span>) : <span className="text-slate-400">No role</span>}</div></td><td className="px-5 py-4"><StatusBadge status={user.status} /></td><td className="px-5 py-4 text-slate-600">{user.lastLoginAt ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(user.lastLoginAt)) : "Never"}</td><td className="whitespace-nowrap px-5 py-4 text-right"><button type="button" onClick={() => onEdit(user)} disabled={deleteLoading} className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50">Edit</button><button type="button" onClick={() => onDelete(user)} disabled={deleteLoading} className="ml-1 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50">Delete</button></td></tr>;
}

function StatusBadge({ status }: { status: ManagedUser["status"] }) {
  const style = status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : status === "SUSPENDED" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>{status[0] + status.slice(1).toLowerCase()}</span>;
}
