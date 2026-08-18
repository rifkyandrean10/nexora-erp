"use client";

import { useState } from "react";

import { deleteUser } from "@/app/actions/user";

import { UserForm } from "./user-form";
import { UserTable } from "./user-table";

export type UserRoleOption = { id: string; name: string; description: string | null; type: "SYSTEM" | "CUSTOM"; isSystem: boolean };
export type ManagedUser = { id: string; organizationId: string; name: string; email: string; phone: string | null; avatar: string | null; status: "ACTIVE" | "INACTIVE" | "SUSPENDED"; lastLoginAt: Date | null; createdAt: Date; updatedAt: Date; roles: { role: Pick<UserRoleOption, "id" | "name" | "type" | "isSystem"> }[] };

type UserPageProps = { users: ManagedUser[]; roles: UserRoleOption[] };

export function UserPage({ users: initialUsers, roles }: UserPageProps) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function openForm(user: ManagedUser | null) { setEditingUser(user); setShowForm(true); setDeleteError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function closeForm() { setEditingUser(null); setShowForm(false); }
  function handleCreated(user: ManagedUser) { setUsers((current) => [user, ...current]); closeForm(); }
  function handleUpdated(updatedUser: ManagedUser) { setUsers((current) => current.map((user) => user.id === updatedUser.id ? updatedUser : user)); closeForm(); }

  async function handleDelete(user: ManagedUser) {
    if (!window.confirm(`Apakah kamu yakin ingin menghapus user "${user.name}"?`)) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const result = await deleteUser(user.id);
      if (!result.success) { setDeleteError(result.message || "User gagal dihapus."); return; }
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (editingUser?.id === user.id) closeForm();
    } catch (error) {
      console.error(error);
      setDeleteError("Terjadi kesalahan saat menghapus user.");
    } finally { setDeleteLoading(false); }
  }

  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Users</h1><p className="mt-1 text-sm text-slate-500">Kelola akses pengguna di organisasi Anda.</p></div><button type="button" onClick={() => showForm && !editingUser ? closeForm() : openForm(null)} className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">{showForm && !editingUser ? "Cancel" : "+ Add User"}</button></div>{deleteError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>}{showForm && <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="text-lg font-semibold text-slate-900">{editingUser ? "Edit User" : "Add User"}</h2><p className="mt-1 text-sm text-slate-500">{editingUser ? `Perbarui informasi ${editingUser.name}.` : "Tambahkan pengguna baru ke organisasi."}</p></div><UserForm key={editingUser?.id ?? "new"} user={editingUser} roles={roles} onCreated={handleCreated} onUpdated={handleUpdated} onCancel={closeForm} /></div>}<UserTable users={users} onEdit={(user) => openForm(user)} onDelete={handleDelete} deleteLoading={deleteLoading} /></div>;
}
