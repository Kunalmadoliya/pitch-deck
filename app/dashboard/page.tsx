import React from "react";
import { headers } from "next/headers";
import { Suspense } from "react";
import { auth } from "@/auth/auth";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardHomeView />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <DashboardHomeView userName={session?.user.name} />;
}
