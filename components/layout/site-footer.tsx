import React from "react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-dotted border-stone-300 dark:border-stone-800 mt-auto bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
          <span className="font-mono text-[11px] tracking-wide">
            Dotted Grid Architecture • Grounded RAG Pipeline Active
          </span>
        </div>

        <div className="flex items-center gap-5 font-mono text-[11px]">
          <span className="text-stone-400 dark:text-stone-600">
            Tenant Isolated // Zero Model Retention
          </span>
          <span className="text-stone-300 dark:text-stone-700 select-none">•</span>
          <Link
            href="/login"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Authenticate SSO
          </Link>
          <span className="text-stone-300 dark:text-stone-700 select-none">•</span>
          <span>© 2026 PolicyExtract</span>
        </div>
      </div>
    </footer>
  );
}
