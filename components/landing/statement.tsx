"use client";

import React from "react";
import { ScanText, CheckCircle2, ShieldCheck } from "lucide-react";

export function LandingStatement() {
  const items = [
    {
      title: "Scans are read automatically",
      icon: <ScanText className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />,
    },
    {
      title: "Answers checked against your documents",
      icon: <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />,
    },
    {
      title: "Private by default",
      icon: <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />,
    },
  ];

  return (
    <section
      aria-label="Core Capabilities"
      className="max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center border-t border-dashed border-stone-200 dark:border-stone-800"
    >
      <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 max-w-2xl mx-auto leading-tight">
        Every answer points back to its page.
      </h2>

      {/* Three tiny inline items in a single row (icons <= 16px, no boxes) */}
      <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-2">
            {item.icon}
            <span>{item.title}</span>
          </div>
        ))}
      </div>

      {/* Inline note: AI Pitch Deck coming soon */}
      <p className="mt-8 text-xs text-stone-400 dark:text-stone-500 font-sans">
        AI Pitch Deck coming soon.
      </p>
    </section>
  );
}
