"use client";

import { useState, useTransition } from "react";

import { updateRolePermission } from "@/app/actions/permissions";

type Permission = {
  id: string;
  module: string;
  action: string;
  name: string;
  description: string | null;
};

type Role = {
  id: string;
  name: string;
  type: string;
};

type RolePermission = {
  roleId: string;
  permissionId: string;
};

type PermissionMatrixProps = {
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
};

export function PermissionMatrix({
  roles,
  permissions,
  rolePermissions,
}: PermissionMatrixProps) {
  const [selectedRoleId, setSelectedRoleId] =
    useState(roles[0]?.id ?? "");

  const [isPending, startTransition] = useTransition();

  const [localPermissions, setLocalPermissions] =
    useState<Set<string>>(
      new Set(
        rolePermissions
          .filter(
            (rolePermission) =>
              rolePermission.roleId ===
              roles[0]?.id
          )
          .map(
            (rolePermission) =>
              rolePermission.permissionId
          )
      )
    );

  function handleRoleChange(roleId: string) {
    setSelectedRoleId(roleId);

    const rolePermissionIds = new Set(
      rolePermissions
        .filter(
          (rolePermission) =>
            rolePermission.roleId === roleId
        )
        .map(
          (rolePermission) =>
            rolePermission.permissionId
        )
    );

    setLocalPermissions(rolePermissionIds);
  }

  function handlePermissionChange(
    permissionId: string,
    checked: boolean
  ) {
    if (!selectedRoleId) {
      return;
    }

    setLocalPermissions((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(permissionId);
      } else {
        next.delete(permissionId);
      }

      return next;
    });

    startTransition(async () => {
      try {
        await updateRolePermission(
          selectedRoleId,
          permissionId,
          checked
        );
      } catch (error) {
        console.error(
          "Failed to update permission:",
          error
        );

        // Kembalikan state jika gagal
        setLocalPermissions((current) => {
          const next = new Set(current);

          if (checked) {
            next.delete(permissionId);
          } else {
            next.add(permissionId);
          }

          return next;
        });
      }
    });
  }

  const groupedPermissions =
    permissions.reduce<
      Record<string, Permission[]>
    >((groups, permission) => {
      if (!groups[permission.module]) {
        groups[permission.module] = [];
      }

      groups[permission.module].push(permission);

      return groups;
    }, {});

  if (roles.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm text-gray-500">
          No roles available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Selector */}
      <div className="rounded-lg border bg-white p-5">
        <label
          htmlFor="role"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Role
        </label>

        <select
          id="role"
          value={selectedRoleId}
          onChange={(event) =>
            handleRoleChange(event.target.value)
          }
          className="w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        >
          {roles.map((role) => (
            <option
              key={role.id}
              value={role.id}
            >
              {role.name}
              {role.type === "SYSTEM"
                ? " (System)"
                : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Matrix */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Permission
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Access
                </th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(
                groupedPermissions
              ).map(
                ([module, modulePermissions]) => (
                  <PermissionModule
                    key={module}
                    module={module}
                    permissions={
                      modulePermissions
                    }
                    selectedPermissions={
                      localPermissions
                    }
                    onChange={
                      handlePermissionChange
                    }
                    disabled={isPending}
                  />
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type PermissionModuleProps = {
  module: string;
  permissions: Permission[];
  selectedPermissions: Set<string>;
  onChange: (
    permissionId: string,
    checked: boolean
  ) => void;
  disabled: boolean;
};

function PermissionModule({
  module,
  permissions,
  selectedPermissions,
  onChange,
  disabled,
}: PermissionModuleProps) {
  return (
    <>
      <tr className="border-y bg-gray-100">
        <td
          colSpan={3}
          className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-600"
        >
          {module.replaceAll("_", " ")}
        </td>
      </tr>

      {permissions.map((permission) => {
        const checked =
          selectedPermissions.has(
            permission.id
          );

        return (
          <tr
            key={permission.id}
            className="border-b last:border-b-0 hover:bg-gray-50"
          >
            <td className="px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {permission.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {permission.module}.
                  {permission.action}
                </p>
              </div>
            </td>

            <td className="px-5 py-4 text-sm text-gray-500">
              {permission.description ?? "-"}
            </td>

            <td className="px-5 py-4 text-center">
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) =>
                  onChange(
                    permission.id,
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-gray-300"
              />
            </td>
          </tr>
        );
      })}
    </>
  );
}