"use client";

import React from "react";
import Link from "next/link";

export function FinalCtaAndFooter() {
  return (
    <div className="w-full">
      {/* Final CTA */}
      <section
        aria-label="Call to action"
        className="max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center border-t border-stone-200/60 dark:border-stone-800/60"
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 mb-8">
          Ready to turn your policies into answers?
        </h2>

        <div>
          <Link
            href="/login"
            className="inline-block whitespace-nowrap px-8 py-3.5 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Minimal Footer with Dashed Top Line */}
      <footer className="border-t border-dashed border-stone-300 dark:border-stone-800 py-8 px-4 sm:px-6">
        <div className="max-w-[1120px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-mono">
          <div className="flex items-center gap-2 font-sans font-semibold text-stone-900 dark:text-stone-100">
            <span className="size-1.5 rounded-full bg-blue-600" />
            <span>PolicyExtract</span>
          </div>

          <div>
            © 2026 PolicyExtract. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
