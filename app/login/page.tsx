import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { LoginForm } from "./login-form";
import { LoginBackdrop } from "@/components/login/login-backdrop";
import { ThemeToggle } from "@/components/theme-toggle";

export const instant = false;

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#fbfbfa] dark:bg-[#0f0f10] text-stone-900 dark:text-stone-100 font-sans selection:bg-blue-600/20 selection:text-blue-900 dark:selection:text-blue-100 transition-colors overflow-hidden">
      {/* Background Animated Dashed Guides */}
      <LoginBackdrop />

      {/* Top Header: Wordmark left, Back to home right */}
      <header className="relative z-10 w-full max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm sm:text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2 group shrink-0"
        >
          <span className="size-2 rounded-full bg-blue-600 transition-transform group-hover:scale-125" />
          <span>PolicyExtract</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium shrink-0">
          <Link
            href="/"
            className="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">← Back to home</span>
            <span className="sm:hidden">← Home</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Center Column: No card, max-w-[340px] on mobile */}
      <main className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Welcome back
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-6 sm:mb-8">
          Sign in to access and search your private documents.
        </p>

        <LoginForm />
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-6 text-center text-[11px] sm:text-xs text-stone-400 dark:text-stone-600 font-mono">
        © 2026 PolicyExtract. All rights reserved.
      </footer>
    </div>
  );
}
