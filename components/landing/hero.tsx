"use client";

import React from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

export function LandingHero() {
  const handleScrollToDemo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("flow-demo");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      aria-label="Overview"
      className="pt-16 pb-12 sm:pt-28 sm:pb-24 text-center max-w-[840px] w-full mx-auto px-4"
    >
      <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 leading-tight sm:leading-[1.14] break-words">
        Ask your company documents with answers you trust.
      </h1>

      <p className="mt-4 sm:mt-6 text-xs sm:text-base md:text-lg text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
        Search enterprise policies and handbooks with automatic scans, clause retrieval, and page-level citations.
      </p>

      <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4 sm:gap-6">
        <Link
          href="/login"
          className="whitespace-nowrap px-7 py-3 rounded-full text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 shrink-0"
        >
          Get started
        </Link>

        <a
          href="#flow-demo"
          onClick={handleScrollToDemo}
          className="whitespace-nowrap text-xs sm:text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>See how it works</span>
          <ArrowDown className="size-3.5" />
        </a>
      </div>
    </section>
  );
}
