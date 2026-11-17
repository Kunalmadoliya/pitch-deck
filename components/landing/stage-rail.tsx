"use client";

import React from "react";
import { DemoStage, DEMO_STAGES } from "@/hooks/use-indexing-demo";

interface StageRailProps {
  currentStage: DemoStage;
  currentStageIndex: number;
  onSelectStage: (index: number) => void;
}

export function StageRail({
  currentStage,
  currentStageIndex,
  onSelectStage,
}: StageRailProps) {
  return (
    <div className="w-full border-b border-stone-200/70 dark:border-stone-800/70 bg-stone-50/50 dark:bg-stone-900/30 px-3 py-2 sm:px-6">
      {/* Mobile Single Step Indicator */}
      <div className="flex sm:hidden items-center justify-between text-xs font-mono">
        <span className="text-stone-400">
          Step {currentStageIndex + 1} of {DEMO_STAGES.length}
        </span>
        <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
          {currentStage}
        </span>
      </div>

      {/* Desktop / Tablet Full Horizontal Rail */}
      <nav
        aria-label="Indexing stages"
        className="hidden sm:flex items-center justify-between gap-1 overflow-x-auto no-scrollbar"
      >
        {DEMO_STAGES.map((s, idx) => {
          const isCurrent = idx === currentStageIndex;
          const isFinished = idx < currentStageIndex;

          return (
            <button
              key={s}
              type="button"
              onClick={() => onSelectStage(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                isCurrent
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 shadow-xs"
                  : isFinished
                  ? "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  : "text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400"
              }`}
            >
              {isFinished ? (
                <svg
                  className="size-3 text-blue-600 dark:text-blue-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span
                  className={`size-1.5 rounded-full shrink-0 ${
                    isCurrent
                      ? "bg-blue-600 dark:bg-blue-400 animate-pulse"
                      : "bg-stone-300 dark:bg-stone-700"
                  }`}
                />
              )}
              <span>{s}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
