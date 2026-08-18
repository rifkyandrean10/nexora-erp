"use client";

import { useState } from "react";

import {
  createRoleSchema,
} from "@/lib/validations/role";

type Role = {
  id: string;
  name: string;
  description: string | null;
  type: "SYSTEM" | "CUSTOM";
  isSystem: boolean;
};

type RoleFormProps = {
  role: Role | null;
  onSubmit: (data: {
    name: string;
    description?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export function RoleForm({
  role,
  onSubmit,
  onCancel,
}: RoleFormProps) {
  const [name, setName] =
    useState(role?.name ?? "");

  const [description, setDescription] =
    useState(role?.description ?? "");

  const [errors, setErrors] =
    useState<Record<string, string[] | undefined>>(
      {}
    );

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrors({});

    const parsed =
      createRoleSchema.safeParse({
        name,
        description,
      });

    if (!parsed.success) {
      setErrors(
        parsed.error.flatten().fieldErrors
      );
      return;
    }

    try {
      setLoading(true);

      await onSubmit(parsed.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          {role
            ? "Edit Role"
            : "Tambah Role"}
        </h2>

        <p className="text-sm text-muted-foreground">
          {role
            ? "Perbarui informasi role custom."
            : "Buat role custom baru untuk organisasi."}
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="role-name"
            className="text-sm font-medium"
          >
            Nama Role
          </label>

          <input
            id="role-name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Contoh: Sales Staff"
            disabled={loading}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />

          {errors.name?.map((message) => (
            <p
              key={message}
              className="text-sm text-destructive"
            >
              {message}
            </p>
          ))}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="role-description"
            className="text-sm font-medium"
          >
            Deskripsi
          </label>

          <textarea
            id="role-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Deskripsi role..."
            rows={4}
            disabled={loading}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />

          {errors.description?.map(
            (message) => (
              <p
                key={message}
                className="text-sm text-destructive"
              >
                {message}
              </p>
            )
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading
            ? "Menyimpan..."
            : role
              ? "Simpan Perubahan"
              : "Buat Role"}
        </button>
      </div>
    </form>
  );
}