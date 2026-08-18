"use client";

import { useState } from "react";

import {
  createRole,
  deleteRole,
  updateRole,
} from "@/app/actions/role";

import type { Role } from "@/types/role";

import { RoleForm } from "./role-form";
import { RoleTable } from "./role-table";

type RolePageProps = {
  roles: Role[];
};

export function RolePage({
  roles: initialRoles,
}: RolePageProps) {
  const [roles, setRoles] =
    useState<Role[]>(initialRoles);

  const [editingRole, setEditingRole] =
    useState<Role | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  async function handleCreate(data: {
    name: string;
    description?: string;
  }) {
    resetMessages();

    const result = await createRole(data);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.data) {
      setRoles((current) => [
        result.data,
        ...current,
      ]);
    }

    setShowForm(false);
    setSuccess(result.message);
  }

  async function handleUpdate(data: {
    name: string;
    description?: string;
  }) {
    if (!editingRole) return;

    resetMessages();

    const result = await updateRole(
      editingRole.id,
      data
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.data) {
      setRoles((current) =>
        current.map((role) =>
          role.id === editingRole.id
            ? result.data
            : role
        )
      );
    }

    setEditingRole(null);
    setSuccess(result.message);
  }

  async function handleDelete(id: string) {
    resetMessages();

    const confirmed =
      window.confirm(
        "Apakah Anda yakin ingin menghapus role ini?"
      );

    if (!confirmed) return;

    const result = await deleteRole(id);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setRoles((current) =>
      current.filter(
        (role) => role.id !== id
      )
    );

    setSuccess(result.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Roles
          </h1>

          <p className="text-sm text-muted-foreground">
            Kelola role dan akses pengguna
            dalam organisasi.
          </p>
        </div>

        {!showForm && !editingRole && (
          <button
            type="button"
            onClick={() => {
              resetMessages();
              setShowForm(true);
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tambah Role
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {(showForm || editingRole) && (
        <RoleForm
          role={editingRole}
          onSubmit={
            editingRole
              ? handleUpdate
              : handleCreate
          }
          onCancel={() => {
            setShowForm(false);
            setEditingRole(null);
            resetMessages();
          }}
        />
      )}

      {!showForm && !editingRole && (
        <RoleTable
          roles={roles}
          onEdit={(role) => {
            resetMessages();
            setEditingRole(role);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}