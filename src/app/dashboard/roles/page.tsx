import { getRoles } from "@/app/actions/role";
import { RolePage } from "@/components/roles/role-page";

export default async function RolesPage() {
  const roles = await getRoles();

  return <RolePage roles={roles} />;
}