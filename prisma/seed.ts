import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { PERMISSIONS } from "@/lib/permissions";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🌱 Starting Nexora ERP seed...\n"
  );

  // =========================================================
  // 1. ORGANIZATION
  // =========================================================

  const organization =
    await prisma.organization.upsert({
      where: {
        slug: "nexora-erp",
      },

      update: {
        name: "Nexora ERP",
        status: "ACTIVE",
      },

      create: {
        name: "Nexora ERP",
        slug: "nexora-erp",
        email: "admin@nexora.local",
        country: "Indonesia",
        currency: "IDR",
        timezone: "Asia/Jakarta",
        status: "ACTIVE",
      },
    });

  console.log(
    `✓ Organization: ${organization.name}`
  );

  // =========================================================
  // 2. SYNCHRONIZE PERMISSIONS
  // =========================================================
  //
  // PERMISSIONS dari:
  //
  // src/lib/permissions.ts
  //
  // menjadi single source of truth.
  //
  // Artinya:
  //
  // permissions.ts
  //       ↓
  //      seed
  //       ↓
  //    Database
  //
  // =========================================================

  console.log(
    "\n🔐 Synchronizing permissions..."
  );

  const permissionRecords = [];

  for (const permission of PERMISSIONS) {
    const record =
      await prisma.permission.upsert({
        where: {
          organizationId_module_action: {
            organizationId:
              organization.id,

            module:
              permission.module,

            action:
              permission.action,
          },
        },

        update: {
          name:
            permission.name,

          description:
            permission.description,
        },

        create: {
          organizationId:
            organization.id,

          module:
            permission.module,

          action:
            permission.action,

          name:
            permission.name,

          description:
            permission.description,
        },
      });

    permissionRecords.push(record);
  }

  console.log(
    `✓ Permissions synchronized: ${permissionRecords.length}`
  );

  // =========================================================
  // 3. REMOVE OLD PERMISSIONS
  // =========================================================
  //
  // Ini penting karena sebelumnya database mungkin
  // hanya mempunyai 12 permission.
  //
  // Sekarang permissions.ts mempunyai permission
  // yang jauh lebih lengkap.
  //
  // Permission yang tidak lagi didefinisikan di
  // permissions.ts akan dihapus.
  //
  // =========================================================

  const validPermissionKeys =
    new Set(
      PERMISSIONS.map(
        (permission) =>
          `${permission.module}.${permission.action}`
      )
    );

  const existingPermissions =
    await prisma.permission.findMany({
      where: {
        organizationId:
          organization.id,
      },
    });

  for (const permission of existingPermissions) {
    const key =
      `${permission.module}.${permission.action}`;

    if (
      !validPermissionKeys.has(key)
    ) {
      await prisma.permission.delete({
        where: {
          id: permission.id,
        },
      });

      console.log(
        `✓ Removed obsolete permission: ${key}`
      );
    }
  }

  // =========================================================
  // 4. ADMIN ROLE
  // =========================================================

  const adminRole =
    await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId:
            organization.id,

          name: "ADMIN",
        },
      },

      update: {
        description:
          "Full access to Nexora ERP",

        type: "SYSTEM",

        isSystem: true,
      },

      create: {
        organizationId:
          organization.id,

        name: "ADMIN",

        description:
          "Full access to Nexora ERP",

        type: "SYSTEM",

        isSystem: true,
      },
    });

  console.log(
    `✓ Role: ${adminRole.name}`
  );

  // =========================================================
  // 5. SYNC ADMIN PERMISSIONS
  // =========================================================
  //
  // ADMIN mendapatkan seluruh permission.
  //
  // =========================================================

  console.log(
    "\n🔑 Synchronizing ADMIN permissions..."
  );

  for (
    const permission of permissionRecords
  ) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId:
            adminRole.id,

          permissionId:
            permission.id,
        },
      },

      update: {},

      create: {
        roleId:
          adminRole.id,

        permissionId:
          permission.id,
      },
    });
  }

  // =========================================================
  // 6. REMOVE ADMIN PERMISSIONS YANG SUDAH TIDAK VALID
  // =========================================================

  const adminRolePermissions =
    await prisma.rolePermission.findMany({
      where: {
        roleId:
          adminRole.id,
      },

      include: {
        permission: true,
      },
    });

  for (
    const rolePermission of
      adminRolePermissions
  ) {
    const permission =
      rolePermission.permission;

    const key =
      `${permission.module}.${permission.action}`;

    if (
      !validPermissionKeys.has(key)
    ) {
      await prisma.rolePermission.delete({
        where: {
          roleId_permissionId: {
            roleId:
              adminRole.id,

            permissionId:
              permission.id,
          },
        },
      });
    }
  }

  console.log(
    `✓ Admin permissions assigned: ${permissionRecords.length}`
  );

  // =========================================================
  // 7. ADMIN PASSWORD
  // =========================================================

  const password =
    "Admin123!";

  const hashedPassword =
    await bcrypt.hash(
      password,
      12
    );

  // =========================================================
  // 8. ADMIN USER
  // =========================================================

  const adminUser =
    await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId:
            organization.id,

          email:
            "admin@nexora.local",
        },
      },

      update: {
        name:
          "Nexora Administrator",

        password:
          hashedPassword,

        status:
          "ACTIVE",
      },

      create: {
        organizationId:
          organization.id,

        name:
          "Nexora Administrator",

        email:
          "admin@nexora.local",

        password:
          hashedPassword,

        status:
          "ACTIVE",
      },
    });

  console.log(
    `✓ Admin user: ${adminUser.email}`
  );

  // =========================================================
  // 9. ASSIGN ADMIN ROLE
  // =========================================================

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId:
          adminUser.id,

        roleId:
          adminRole.id,
      },
    },

    update: {},

    create: {
      userId:
        adminUser.id,

      roleId:
        adminRole.id,
    },
  });

  console.log(
    "✓ Admin role assigned"
  );

  // =========================================================
  // 10. FINAL VERIFICATION
  // =========================================================

  const finalPermissions =
    await prisma.permission.findMany({
      where: {
        organizationId:
          organization.id,
      },

      orderBy: [
        {
          module: "asc",
        },
        {
          action: "asc",
        },
      ],
    });

  const finalAdminPermissions =
    await prisma.rolePermission.findMany({
      where: {
        roleId:
          adminRole.id,
      },

      include: {
        permission: true,
      },
    });

  // =========================================================
  // 11. SUMMARY
  // =========================================================

  console.log("");

  console.log(
    "===================================="
  );

  console.log(
    "       NEXORA ERP SEED COMPLETE"
  );

  console.log(
    "===================================="
  );

  console.log("");

  console.log(
    `Organization : ${organization.name}`
  );

  console.log(
    `Admin Email  : ${adminUser.email}`
  );

  console.log(
    `Admin Role   : ${adminRole.name}`
  );

  console.log(
    `Permissions  : ${finalPermissions.length}`
  );

  console.log(
    `Admin Access : ${finalAdminPermissions.length}`
  );

  console.log("");

  console.log(
    "Login credentials:"
  );

  console.log(
    `Email    : ${adminUser.email}`
  );

  console.log(
    `Password : ${password}`
  );

  console.log("");

  console.log(
    "Available permissions:"
  );

  for (
    const permission of
      finalPermissions
  ) {
    console.log(
      `  ✓ ${permission.module}.${permission.action}`
    );
  }

  console.log("");
}

main()
  .catch((error) => {
    console.error(
      "❌ Seed failed:"
    );

    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });