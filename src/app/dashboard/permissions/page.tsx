import { requirePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

import { PermissionMatrix } from "@/components/dashboard/permission-matrix";

export default async function PermissionsPage() {
  const user = await requirePermission(
    "PERMISSION",
    "VIEW"
  );

  const organizationId = user.organizationId;

  const [roles, permissions, rolePermissions] =
    await Promise.all([
      prisma.role.findMany({
        where: {
          organizationId,
        },
        orderBy: [
          {
            type: "asc",
          },
          {
            name: "asc",
          },
        ],
        select: {
          id: true,
          name: true,
          type: true,
        },
      }),

      prisma.permission.findMany({
        where: {
          organizationId,
        },
        orderBy: [
          {
            module: "asc",
          },
          {
            action: "asc",
          },
        ],
        select: {
          id: true,
          module: true,
          action: true,
          name: true,
          description: true,
        },
      }),

      prisma.rolePermission.findMany({
        where: {
          role: {
            organizationId,
          },
        },
        select: {
          roleId: true,
          permissionId: true,
        },
      }),
    ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Permission Matrix
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage permissions assigned to each
          role in your organization.
        </p>
      </div>

      <PermissionMatrix
        roles={roles}
        permissions={permissions}
        rolePermissions={rolePermissions}
      />
    </div>
  );
}