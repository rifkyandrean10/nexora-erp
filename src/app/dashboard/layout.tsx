import { getVisibleNavigation } from "@/components/dashboard/get-navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navigation, session] = await Promise.all([
    getVisibleNavigation(),
    auth(),
  ]);

  return (
    <DashboardShell
      navigation={navigation}
      user={{
        name: session?.user?.name ?? "User",
        email: session?.user?.email ?? "",
      }}
    >
      {children}
    </DashboardShell>
  );
}