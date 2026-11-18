"use client";

import React from "react";
import { Check } from "lucide-react";
import { UPLOAD_STAGES } from "@/hooks/use-landing-demo";

interface StageRailProps {
  currentIndex: number;
}

export function StageRail({ currentIndex }: StageRailProps) {
  const currentName = UPLOAD_STAGES[currentIndex];

  return (
    <div className="w-full">
      {/* Mobile (<640px): Compact single label */}
      <div className="sm:hidden flex items-center justify-between text-xs py-1 px-1 font-sans">
        <span className="text-stone-500 dark:text-stone-400">
          Step {currentIndex + 1} of {UPLOAD_STAGES.length}
        </span>
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {currentName}
        </span>
      </div>

      {/* Desktop (>=640px): Full horizontal stage rail */}
      <div className="hidden sm:flex items-center justify-between gap-1 border-b border-dashed border-stone-200 dark:border-stone-800 pb-3">
        {UPLOAD_STAGES.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={stage}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 ${
                isCurrent
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium"
                  : isDone
                  ? "text-stone-700 dark:text-stone-300"
                  : "text-stone-400 dark:text-stone-600"
              }`}
            >
              <span
                className={`size-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "bg-blue-600 text-white"
                    : "border border-stone-300 dark:border-stone-700"
                }`}
              >
                {isDone ? <Check className="size-2.5 stroke-[3]" /> : idx + 1}
              </span>
              <span className="truncate">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
