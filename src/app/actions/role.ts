"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";

import {
  createRoleSchema,
  updateRoleSchema,
  type CreateRoleInput,
  type UpdateRoleInput,
} from "@/lib/validations/role";

const roleSelect = {
  id: true,
  organizationId: true,
  name: true,
  description: true,
  type: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      users: true,
      permissions: true,
    },
  },
} as const;

/**
 * Get all roles belonging to current organization.
 */
export async function getRoles() {
  await requirePermission("ROLE", "VIEW");

  const organizationId =
    await requireOrganizationId();

  return prisma.role.findMany({
    where: {
      organizationId,
    },
    select: roleSelect,
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Create custom role.
 */
export async function createRole(
  input: CreateRoleInput
) {
  await requirePermission("ROLE", "CREATE");

  const organizationId =
    await requireOrganizationId();

  const parsed =
    createRoleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data role tidak valid.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const name = data.name.trim();

  const existingRole =
    await prisma.role.findFirst({
      where: {
        organizationId,
        name,
      },
      select: {
        id: true,
      },
    });

  if (existingRole) {
    return {
      success: false,
      message: "Nama role sudah digunakan.",
    };
  }

  const role = await prisma.role.create({
    data: {
      organizationId,
      name,
      description:
        data.description || null,
      type: "CUSTOM",
      isSystem: false,
    },
    select: roleSelect,
  });

  revalidatePath("/dashboard/roles");

  return {
    success: true,
    message: "Role berhasil dibuat.",
    data: role,
  };
}

/**
 * Update custom role.
 *
 * SYSTEM role tidak boleh diubah.
 */
export async function updateRole(
  id: string,
  input: UpdateRoleInput
) {
  await requirePermission("ROLE", "UPDATE");

  const organizationId =
    await requireOrganizationId();

  const parsed =
    updateRoleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data role tidak valid.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const role = await prisma.role.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
      name: true,
      type: true,
      isSystem: true,
    },
  });

  if (!role) {
    return {
      success: false,
      message: "Role tidak ditemukan.",
    };
  }

  if (
    role.isSystem ||
    role.type === "SYSTEM"
  ) {
    return {
      success: false,
      message:
        "System role tidak dapat diubah.",
    };
  }

  const name = data.name.trim();

  const duplicateRole =
    await prisma.role.findFirst({
      where: {
        organizationId,
        name,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

  if (duplicateRole) {
    return {
      success: false,
      message: "Nama role sudah digunakan.",
    };
  }

  const updatedRole =
    await prisma.role.update({
      where: {
        id: role.id,
      },
      data: {
        name,
        description:
          data.description || null,
      },
      select: roleSelect,
    });

  revalidatePath("/dashboard/roles");

  return {
    success: true,
    message: "Role berhasil diperbarui.",
    data: updatedRole,
  };
}

/**
 * Delete custom role.
 *
 * SYSTEM role tidak boleh dihapus.
 */
export async function deleteRole(
  id: string
) {
  await requirePermission("ROLE", "DELETE");

  const organizationId =
    await requireOrganizationId();

  const role = await prisma.role.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
      name: true,
      type: true,
      isSystem: true,
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (!role) {
    return {
      success: false,
      message: "Role tidak ditemukan.",
    };
  }

  if (
    role.isSystem ||
    role.type === "SYSTEM"
  ) {
    return {
      success: false,
      message:
        "System role tidak dapat dihapus.",
    };
  }

  if (role._count.users > 0) {
    return {
      success: false,
      message:
        "Role tidak dapat dihapus karena masih digunakan oleh user.",
    };
  }

  await prisma.role.delete({
    where: {
      id: role.id,
    },
  });

  revalidatePath("/dashboard/roles");
  revalidatePath("/dashboard/permissions");

  return {
    success: true,
    message: "Role berhasil dihapus.",
  };
}