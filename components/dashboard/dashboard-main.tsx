"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function DashboardMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/dashboard/rag/chat");

  return (
    <main
      className={
        isChat
          ? "min-w-0 flex-1 h-screen overflow-hidden"
          : "flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12"
      }
    >
      {children}
    </main>
  );
}
