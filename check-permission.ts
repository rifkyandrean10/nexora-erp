import { prisma } from "@/lib/prisma";

async function main() {
  console.log("\n====================================");
  console.log("   NEXORA PERMISSION DEBUG");
  console.log("====================================\n");

  const user = await prisma.user.findUnique({
    where: {
      organizationId_email: {
        organizationId: (
          await prisma.organization.findUniqueOrThrow({
            where: {
              slug: "nexora-erp",
            },
            select: {
              id: true,
            },
          })
        ).id,
        email: "admin@nexora.local",
      },
    },

    include: {
      organization: true,

      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.log("❌ ADMIN USER TIDAK DITEMUKAN");
    return;
  }

  console.log("USER");
  console.log("────────────────────────────────────");
  console.log("ID           :", user.id);
  console.log("Name         :", user.name);
  console.log("Email        :", user.email);
  console.log("Organization :", user.organization.name);
  console.log("Organization ID:", user.organizationId);

  console.log("\nROLES");
  console.log("────────────────────────────────────");

  for (const userRole of user.roles) {
    console.log("Role:", userRole.role.name);
    console.log("Role ID:", userRole.role.id);

    console.log("\nPermissions:");

    for (const rolePermission of userRole.role.permissions) {
      console.log(
        `  ✓ ${rolePermission.permission.module}.${rolePermission.permission.action}`
      );
    }
  }

  const hasCustomerView = user.roles.some((userRole) =>
    userRole.role.permissions.some(
      (rolePermission) =>
        rolePermission.permission.module === "CUSTOMER" &&
        rolePermission.permission.action === "VIEW"
    )
  );

  console.log("\n====================================");
  console.log(
    "CUSTOMER.VIEW:",
    hasCustomerView ? "✓ TRUE" : "❌ FALSE"
  );
  console.log("====================================\n");
}

main()
  .catch((error) => {
    console.error("❌ ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });