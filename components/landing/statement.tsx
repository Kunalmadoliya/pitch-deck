"use client";

import React from "react";

export function LandingStatement() {
  const items = [
    {
      title: "Scans are read automatically",
      icon: (
        <svg className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      title: "Page-level sources",
      icon: (
        <svg className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Private by default",
      icon: (
        <svg className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  return (
    <section
      aria-label="Core Capabilities"
      className="max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center border-t border-stone-200/60 dark:border-stone-800/60"
    >
      {/* Single Large Sentence */}
      <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 max-w-2xl mx-auto leading-tight">
        Every answer will point back to its page.
      </h2>

      {/* Three Tiny Inline Items in One Row (no boxes, icons <= 16px) */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-2">
            {item.icon}
            <span>{item.title}</span>
          </div>
        ))}
      </div>

      {/* Small "Coming soon" note: inline text only */}
      <div className="mt-6 text-xs text-stone-400 dark:text-stone-500 font-mono">
        Coming soon: asking questions with cited answers and AI Pitch Deck.
      </div>
    </section>
  );
}
