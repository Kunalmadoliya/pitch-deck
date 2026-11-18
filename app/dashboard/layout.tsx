import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth/auth";
import { DashboardRail } from "@/components/dashboard/dashboard-rail";
import { DashboardMain } from "@/components/dashboard/dashboard-main";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fbfbfa] dark:bg-[#0f0f10] text-stone-900 dark:text-stone-100 font-sans selection:bg-blue-600/20 selection:text-blue-900 dark:selection:text-blue-100 transition-colors">
      <Suspense fallback={<DashboardShell>{children}</DashboardShell>}>
        <AuthenticatedDashboard userChildren={children} />
      </Suspense>
    </div>
  );
}

async function AuthenticatedDashboard({
  userChildren,
}: {
  userChildren: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    if (process.env.NODE_ENV === "development") {
      const mockUser = { name: "Developer", email: "dev@example.com" };
      return <DashboardShell user={mockUser}>{userChildren}</DashboardShell>;
    }
    redirect("/login");
  }

  return <DashboardShell user={session.user}>{userChildren}</DashboardShell>;
}

function DashboardShell({
  user,
  children,
}: {
  user?: React.ComponentProps<typeof DashboardRail>["user"];
  children: React.ReactNode;
}) {
  return (
    <>
      {user && <DashboardRail user={user} />}
      <DashboardMain>{children}</DashboardMain>
    </>
  );
}
