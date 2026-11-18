"use client";

import Link from "next/link";
import { useSession } from "@/hooks/use-auth";

export function NavAuthButton() {
  const sessionResult = useSession();
  const user = sessionResult?.data?.user;

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="whitespace-nowrap text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-stone-950 border border-dotted border-blue-300 dark:border-blue-800 hover:bg-blue-600 dark:hover:bg-blue-400 hover:border-transparent px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.97]"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="whitespace-nowrap text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 hover:text-white dark:hover:text-stone-950 border border-dotted border-stone-300 dark:border-stone-700 hover:bg-stone-900 dark:hover:bg-white hover:border-transparent px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.97]"
    >
      Sign in
    </Link>
  );
}
