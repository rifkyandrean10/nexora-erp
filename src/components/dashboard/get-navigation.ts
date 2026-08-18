import { getCurrentUserPermissions } from "@/lib/authorization";

import {
  navigationGroups,
  type NavigationGroup,
} from "./navigation";

export async function getVisibleNavigation(): Promise<
  NavigationGroup[]
> {
  const permissions =
    await getCurrentUserPermissions();

  const permissionKeys = new Set(
    permissions.map(
      (permission) =>
        `${permission.module}.${permission.action}`.toUpperCase()
    )
  );

  console.log("====================================");
  console.log("SIDEBAR NAVIGATION DEBUG");
  console.log("PERMISSION COUNT:", permissionKeys.size);
  console.log(
    "PERMISSIONS:",
    JSON.stringify(
      [...permissionKeys],
      null,
      2
    )
  );

  const visibleNavigation =
    navigationGroups
      .map((group) => ({
        ...group,

        items: group.items.filter((item) => {
          if (!item.permission) {
            return true;
          }

          return permissionKeys.has(
            item.permission.toUpperCase()
          );
        }),
      }))
      .filter(
        (group) => group.items.length > 0
      );

  console.log(
    "VISIBLE NAVIGATION:",
    JSON.stringify(
      visibleNavigation,
      null,
      2
    )
  );

  console.log("====================================");

  return visibleNavigation;
}