"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSignOut } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "./mobile-nav";

interface DashboardRailProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardRail({ user }: DashboardRailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = useSignOut();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.push("/login");
    } catch {
      setSigningOut(false);
    }
  };

  const navLinks = [
    {
      label: "Overview",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Document RAG",
      href: "/dashboard/rag",
      active: pathname.startsWith("/dashboard/rag"),
    },
  ];

  return (
    <>
      <MobileNav
        user={user}
        navLinks={navLinks}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />

      {/* Desktop Left Rail */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-dotted border-stone-300 dark:border-stone-800 min-h-screen sticky top-0 p-6 bg-transparent">
        <div className="space-y-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="size-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-stone-900 dark:text-stone-100 block leading-tight">
                PolicyExtract
              </span>
              <span className="text-[10px] font-mono text-stone-400">Company Intelligence</span>
            </div>
          </Link>

          <nav className="space-y-1.5" aria-label="Dashboard navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  link.active
                    ? "bg-stone-200/70 dark:bg-stone-800/80 text-stone-950 dark:text-stone-50 font-semibold"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/60 dark:hover:bg-stone-800/40"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center justify-between px-4 py-2.5 rounded-full text-sm text-stone-400 dark:text-stone-600 cursor-not-allowed select-none">
              <span>AI Pitch Deck</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800/50 text-stone-400">
                Soon
              </span>
            </div>
          </nav>
        </div>

        <div className="pt-6 border-t border-dotted border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400">Theme</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-semibold text-xs shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                {user.name || "User"}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                {user.email || ""}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 py-2 rounded-full border border-dotted border-stone-200 dark:border-stone-800 hover:border-red-300 dark:hover:border-red-900 transition-colors"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
