import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth/auth";
import { LoginForm } from "./login-form";
import { LoginBackdrop } from "@/components/login/login-backdrop";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }

  return <LoginShell />;
}

function LoginShell() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#fbfbfa] dark:bg-[#0f0f10] text-stone-900 dark:text-stone-100 font-sans selection:bg-blue-600/20 selection:text-blue-900 dark:selection:text-blue-100 transition-colors overflow-hidden">
      <LoginBackdrop />
      <header className="relative z-10 w-full max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2 group"
        >
          <span className="size-2 rounded-full bg-blue-600 transition-transform group-hover:scale-125" />
          <span>PolicyExtract</span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-medium">
          <Link
            href="/"
            className="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          >
            ← Back to home
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="relative z-10 w-full max-w-[380px] mx-auto px-4 py-12 flex flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Welcome back
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-8">
          Sign in to access and search your private documents.
        </p>
        <LoginForm />
      </main>
      <footer className="relative z-10 w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-6 text-center text-xs text-stone-400 dark:text-stone-600 font-mono">
        © 2026 PolicyExtract. All rights reserved.
      </footer>
    </div>
  );
}
