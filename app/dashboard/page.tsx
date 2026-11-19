import React from "react";
import { Suspense } from "react";
import { getServerSession } from "@/auth/session";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardHomeView />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await getServerSession();

  return <DashboardHomeView userName={session?.user.name} />;
}
