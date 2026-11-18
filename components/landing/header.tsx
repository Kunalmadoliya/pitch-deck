"use client";

import React from "react";
import Link from "next/link";
import { NavAuthButton } from "@/components/layout/nav-auth-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#fbfbfa]/85 dark:bg-[#0f0f10]/85 transition-colors">
      <div className="max-w-[1120px] w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2 group shrink-0"
        >
          <span className="size-2 rounded-full bg-blue-600 transition-transform group-hover:scale-125" />
          <span>PolicyExtract</span>
        </Link>

        <div className="flex items-center gap-3 shrink-0">
          <NavAuthButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
