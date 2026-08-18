"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";

export async function updateRolePermission(
  roleId: string,
  permissionId: string,
  enabled: boolean
) {
  const user = await requirePermission(
    "PERMISSION",
    "ASSIGN"
  );

  const organizationId = user.organizationId;

  // Pastikan role berasal dari organization user
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      organizationId,
    },
  });

  if (!role) {
    throw new Error("ROLE_NOT_FOUND");
  }

  // Pastikan permission berasal dari organization user
  const permission = await prisma.permission.findFirst({
    where: {
      id: permissionId,
      organizationId,
    },
  });

  if (!permission) {
    throw new Error("PERMISSION_NOT_FOUND");
  }

  if (enabled) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
      create: {
        roleId,
        permissionId,
      },
      update: {},
    });
  } else {
    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  revalidatePath("/dashboard/permissions");

  return {
    success: true,
  };
}
