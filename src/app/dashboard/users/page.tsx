import { getUserRoles, getUsers } from "@/app/actions/user";
import { UserPage } from "@/components/users/user-page";

export default async function UsersPage() {
  const [users, roles] = await Promise.all([
    getUsers(),
    getUserRoles(),
  ]);

  return <UserPage users={users} roles={roles} />;
}
