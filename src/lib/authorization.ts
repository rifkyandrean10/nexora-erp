import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const userAuthorizationInclude = {
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
} as const;

/**
 * =========================================================
 * GET CURRENT USER
 * =========================================================
 *
 * Mengambil user yang sedang login beserta:
 *
 * User
 * ├── Organization
 * └── Roles
 *      └── Permissions
 *
 * Organization ID berasal dari session dan juga
 * digunakan sebagai tenant boundary.
 */
export async function getCurrentUser() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,

      // IMPORTANT:
      // User harus berada di organization yang sama
      // dengan organization di session.
      organizationId: session.user.organizationId,

      status: "ACTIVE",
    },

    include: userAuthorizationInclude,
  });

  return user;
}

/**
 * =========================================================
 * REQUIRE AUTHENTICATION
 * =========================================================
 *
 * Memastikan user sudah login dan masih aktif.
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

/**
 * =========================================================
 * REQUIRE PERMISSION
 * =========================================================
 *
 * Contoh:
 *
 * await requirePermission(
 *   "CUSTOMER",
 *   "VIEW"
 * );
 *
 * Permission akan dicek berdasarkan:
 *
 * User
 *   ↓
 * UserRole
 *   ↓
 * Role
 *   ↓
 * RolePermission
 *   ↓
 * Permission
 */
export async function requirePermission(
  module: string,
  action: string
) {
  const user = await requireAuth();

  const requestedPermission =
    `${module}.${action}`.toUpperCase();

  /**
   * Ambil semua permission dari seluruh role user.
   */
  const permissionKeys = user.roles.flatMap(
    (userRole) =>
      userRole.role.permissions.map(
        (rolePermission) =>
          `${rolePermission.permission.module}.${rolePermission.permission.action}`.toUpperCase()
      )
  );

  /**
   * Hilangkan duplicate permission.
   */
  const uniquePermissions = [
    ...new Set(permissionKeys),
  ];

  const hasPermission =
    uniquePermissions.includes(
      requestedPermission
    );

  /**
   * DEBUG
   *
   * Bisa dihapus nanti setelah authorization
   * sudah stabil.
   */
  console.log(
    "\n===================================="
  );

  console.log(
    "AUTHORIZATION DEBUG"
  );

  console.log(
    "===================================="
  );

  console.log(
    "SESSION USER ID:",
    user.id
  );

  console.log(
    "SESSION ORGANIZATION ID:",
    user.organizationId
  );

  console.log(
    "REQUESTED PERMISSION:",
    requestedPermission
  );

  console.log(
    "USER ROLES:",
    user.roles.map(
      (userRole) =>
        userRole.role.name
    )
  );

  console.log(
    "USER PERMISSIONS:",
    JSON.stringify(
      uniquePermissions,
      null,
      2
    )
  );

  console.log(
    "HAS REQUESTED PERMISSION:",
    hasPermission
  );

  console.log(
    "====================================\n"
  );

  if (!hasPermission) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

/**
 * =========================================================
 * REQUIRE ORGANIZATION ACCESS
 * =========================================================
 *
 * Memastikan resource berasal dari organization
 * yang sama dengan user yang sedang login.
 *
 * Ini adalah salah satu bagian penting dari
 * multi-tenant authorization.
 */
export async function requireOrganizationAccess(
  organizationId: string
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    throw new Error("UNAUTHORIZED");
  }

  if (
    session.user.organizationId !==
    organizationId
  ) {
    throw new Error("FORBIDDEN");
  }

  return session.user;
}

/**
 * =========================================================
 * REQUIRE ORGANIZATION ID
 * =========================================================
 *
 * Digunakan oleh query Prisma.
 *
 * Contoh:
 *
 * const organizationId =
 *   await requireOrganizationId();
 *
 * const customers =
 *   await prisma.customer.findMany({
 *     where: {
 *       organizationId,
 *     },
 *   });
 */
export async function requireOrganizationId() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.organizationId;
}

/**
 * =========================================================
 * HAS PERMISSION
 * =========================================================
 *
 * Berbeda dengan requirePermission():
 *
 * requirePermission()
 * → throw error jika tidak memiliki permission
 *
 * hasPermission()
 * → return true / false
 *
 * Cocok untuk conditional UI.
 */
export async function hasPermission(
  module: string,
  action: string
): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const requestedPermission =
    `${module}.${action}`.toUpperCase();

  return user.roles.some(
    (userRole) =>
      userRole.role.permissions.some(
        (rolePermission) => {
          const permission =
            `${rolePermission.permission.module}.${rolePermission.permission.action}`
              .toUpperCase();

          return (
            permission ===
            requestedPermission
          );
        }
      )
  );
}

/**
 * =========================================================
 * GET CURRENT USER ROLES
 * =========================================================
 */
export async function getCurrentUserRoles() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  return user.roles.map(
    (userRole) =>
      userRole.role
  );
}

/**
 * =========================================================
 * GET CURRENT USER PERMISSIONS
 * =========================================================
 *
 * Mengambil semua permission user.
 *
 * Dipakai oleh:
 *
 * - Sidebar
 * - Permission Matrix
 * - Conditional UI
 * - Authorization
 */
export async function getCurrentUserPermissions() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const permissions =
    user.roles.flatMap(
      (userRole) =>
        userRole.role.permissions.map(
          (rolePermission) =>
            rolePermission.permission
        )
    );

  /**
   * Hilangkan duplicate permission
   * jika user mempunyai beberapa role
   * dengan permission yang sama.
   */
  const uniquePermissions =
    permissions.filter(
      (permission, index, array) =>
        index ===
        array.findIndex(
          (item) =>
            item.module ===
              permission.module &&
            item.action ===
              permission.action
        )
    );

  return uniquePermissions;
}