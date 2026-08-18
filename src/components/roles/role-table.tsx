"use client";

import { useMemo, useState } from "react";

import type { Role } from "@/types/role";

type RoleTableProps = {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (id: string) => Promise<void>;
};

export function RoleTable({
  roles,
  onEdit,
  onDelete,
}: RoleTableProps) {
  const [search, setSearch] =
    useState("");

  const filteredRoles = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return roles;
    }

    return roles.filter((role) =>
      [
        role.name,
        role.description ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [roles, search]);

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b p-4">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Cari role..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary sm:max-w-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Role
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Tipe
              </th>

              <th className="px-4 py-3 text-center font-medium">
                Users
              </th>

              <th className="px-4 py-3 text-center font-medium">
                Permissions
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRoles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Tidak ada role ditemukan.
                </td>
              </tr>
            ) : (
              filteredRoles.map((role) => {
                const system =
                  role.isSystem ||
                  role.type === "SYSTEM";

                return (
                  <tr
                    key={role.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {role.name}
                      </div>

                      {role.description && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {role.description}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          system
                            ? "rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                            : "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        }
                      >
                        {system
                          ? "SYSTEM"
                          : "CUSTOM"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      {role._count.users}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {role._count.permissions}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {!system && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onEdit(role)
                              }
                              className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onDelete(
                                  role.id
                                )
                              }
                              className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                            >
                              Hapus
                            </button>
                          </>
                        )}

                        {system && (
                          <span className="text-xs text-muted-foreground">
                            Protected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}