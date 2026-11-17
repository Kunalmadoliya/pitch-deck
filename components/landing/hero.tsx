"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";

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
      className="pt-20 pb-16 sm:pt-28 sm:pb-24 text-center max-w-[840px] mx-auto px-4"
    >
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-4xl sm:text-6xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 leading-[1.12]"
      >
        Turn company documents into searchable knowledge.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mt-6 text-base sm:text-lg text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed"
      >
        Upload policies and handbooks to extract clear, page-cited answers with automated scanning.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="mt-10 flex items-center justify-center gap-6"
      >
        <Link
          href="/login"
          className="whitespace-nowrap px-7 py-3 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Get started
        </Link>

        <a
          href="#flow-demo"
          onClick={handleScrollToDemo}
          className="whitespace-nowrap text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>See how it works</span>
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}
