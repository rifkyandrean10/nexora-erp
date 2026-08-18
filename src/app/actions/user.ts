"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  requireOrganizationId,
  requirePermission,
} from "@/lib/authorization";
import {
  createUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  updateUserSchema,
} from "@/lib/validations/user";

const userSelect = {
  id: true,
  organizationId: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  roles: {
    include: {
      role: {
        select: {
          id: true,
          name: true,
          type: true,
          isSystem: true,
        },
      },
    },
  },
} as const;

export async function getUsers() {
  await requirePermission("USER", "VIEW");

  const organizationId = await requireOrganizationId();

  return prisma.user.findMany({
    where: {
      organizationId,
    },
    select: userSelect,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createUser(input: CreateUserInput) {
  await requirePermission("USER", "CREATE");

  const organizationId = await requireOrganizationId();

  const parsed = createUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data user tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const role = await prisma.role.findFirst({
    where: {
      id: data.roleId,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!role) {
    return {
      success: false,
      message: "Role tidak ditemukan.",
    };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      organizationId,
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Email user sudah digunakan.",
    };
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    12
  );

  const user = await prisma.user.create({
    data: {
      organizationId,
      name: data.name,
      email,
      phone: data.phone || null,
      password: hashedPassword,
      status: data.status,

      roles: {
        create: {
          roleId: role.id,
        },
      },
    },
    select: userSelect,
  });

  return {
    success: true,
    message: "User berhasil dibuat.",
    data: user,
  };
}

export async function updateUser(id: string, input: UpdateUserInput) {
  await requirePermission("USER", "UPDATE");

  const organizationId = await requireOrganizationId();

  const parsed = updateUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data user tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "User tidak ditemukan.",
    };
  }

  const role = await prisma.role.findFirst({
    where: {
      id: data.roleId,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!role) {
    return {
      success: false,
      message: "Role tidak ditemukan.",
    };
  }

  const duplicateEmail =
    await prisma.user.findFirst({
      where: {
        organizationId,
        email,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

  if (duplicateEmail) {
    return {
      success: false,
      message: "Email user sudah digunakan.",
    };
  }

  const updateData: {
    name: string;
    email: string;
    phone: string | null;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    password?: string;
  } = {
    name: data.name,
    email,
    phone: data.phone || null,
    status: data.status,
  };

  if (data.password) {
    updateData.password =
      await bcrypt.hash(
        data.password,
        12
      );
  }

  const updatedUser =
    await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: updateData,
        });

        await tx.userRole.deleteMany({
          where: {
            userId: user.id,
          },
        });

        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });

        return tx.user.findUnique({
          where: {
            id: user.id,
          },
          select: userSelect,
        });
      }
    );

  return {
    success: true,
    message: "User berhasil diperbarui.",
    data: updatedUser,
  };
}

export async function deleteUser(id: string) {
  await requirePermission("USER", "DELETE");

  const organizationId =
    await requireOrganizationId();

  const user = await prisma.user.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "User tidak ditemukan.",
    };
  }

  const adminEmail = "admin@nexora.local";

  if (user.email === adminEmail) {
    return {
      success: false,
      message:
        "Administrator utama tidak dapat dihapus.",
    };
  }

  await prisma.user.delete({
    where: {
      id: user.id,
    },
  });

  return {
    success: true,
    message: "User berhasil dihapus.",
  };
}

export async function getUserRoles() {
  await requirePermission("USER", "VIEW");

  const organizationId =
    await requireOrganizationId();

  return prisma.role.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      isSystem: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
