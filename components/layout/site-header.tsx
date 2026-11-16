import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-dotted border-stone-300 dark:border-stone-800 bg-[#fbfbfa]/80 dark:bg-[#0f0f10]/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo (Family.co style) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-full"
        >
          <div className="size-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
            P
          </div>
          <span className="font-semibold text-base sm:text-lg tracking-tight text-stone-900 dark:text-stone-100">
            PolicyExtract
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] text-stone-500 dark:text-stone-400 border border-dotted border-stone-300 dark:border-stone-800 px-2 py-0.5 rounded-full">
            RAG v2
          </span>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 hover:text-white dark:hover:text-stone-950 border border-dotted border-stone-300 dark:border-stone-700 hover:bg-stone-900 dark:hover:bg-white hover:border-transparent px-4 py-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.97]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
