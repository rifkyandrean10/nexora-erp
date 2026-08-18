"use client";

import { useState, type FormEvent } from "react";

import { createUser, updateUser } from "@/app/actions/user";
import {
  createUserSchema,
  type CreateUserInput,
  updateUserSchema,
} from "@/lib/validations/user";

import type { ManagedUser, UserRoleOption } from "./user-page";

type UserFormProps = {
  user: ManagedUser | null;
  roles: UserRoleOption[];
  onCreated: (user: ManagedUser) => void;
  onUpdated: (user: ManagedUser) => void;
  onCancel: () => void;
};

const initialForm: CreateUserInput = { name: "", email: "", phone: "", password: "", roleId: "", status: "ACTIVE" };

function userToForm(user: ManagedUser): CreateUserInput {
  return { name: user.name, email: user.email, phone: user.phone ?? "", password: "", roleId: user.roles[0]?.role.id ?? "", status: user.status };
}

export function UserForm({ user, roles, onCreated, onUpdated, onCancel }: UserFormProps) {
  const [form, setForm] = useState<CreateUserInput>(() => user ? userToForm(user) : initialForm);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditMode = Boolean(user);

  function updateField(field: keyof CreateUserInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      const result = user
        ? await submitUpdate(user.id)
        : await submitCreate();
      if (!result.success) {
        if (result.errors) setErrors(result.errors);
        setServerError(result.message || "User gagal disimpan.");
        return;
      }
      if (result.data) {
        if (user) onUpdated(result.data);
        else onCreated(result.data);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "VALIDATION_ERROR") return;
      console.error(error);
      setServerError("Terjadi kesalahan saat menyimpan user.");
    } finally {
      setLoading(false);
    }
  }

  async function submitCreate() {
    const parsed = createUserSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      throw new Error("VALIDATION_ERROR");
    }
    return createUser(parsed.data);
  }

  async function submitUpdate(id: string) {
    const parsed = updateUserSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      throw new Error("VALIDATION_ERROR");
    }
    return updateUser(id, parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nama" required error={errors.name}><input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Nama lengkap" className={inputClass(!!errors.name)} /></Field>
        <Field label="Email" required error={errors.email}><input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="user@company.com" className={inputClass(!!errors.email)} /></Field>
        <Field label="Nomor telepon" error={errors.phone}><input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="08123456789" className={inputClass(!!errors.phone)} /></Field>
        <Field label="Role" required error={errors.roleId}><select value={form.roleId} onChange={(event) => updateField("roleId", event.target.value)} className={inputClass(!!errors.roleId)}><option value="">Pilih role</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}{role.isSystem ? " (System)" : ""}</option>)}</select></Field>
        <Field label={isEditMode ? "Password baru" : "Password"} required={!isEditMode} error={errors.password}><input type="password" autoComplete="new-password" value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder={isEditMode ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"} className={inputClass(!!errors.password)} />{isEditMode && <p className="text-xs text-slate-500">Kosongkan untuk mempertahankan password saat ini.</p>}</Field>
        <Field label="Status" required error={errors.status}><select value={form.status} onChange={(event) => updateField("status", event.target.value)} className={inputClass(!!errors.status)}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option></select></Field>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Cancel</button><button type="submit" disabled={loading || roles.length === 0} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50">{loading ? "Saving..." : isEditMode ? "Update User" : "Save User"}</button></div>
      {roles.length === 0 && <p className="text-sm text-amber-700">Belum ada role yang tersedia. Buat role terlebih dahulu sebelum menambahkan user.</p>}
    </form>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string[]; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>{children}{error?.map((message) => <p key={message} className="text-xs text-red-600">{message}</p>)}</div>;
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${hasError ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"}`;
}
