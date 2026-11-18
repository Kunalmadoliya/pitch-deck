"use client";

import React from "react";
import { type QueryStage, stageLabel } from "@/lib/api/chat-types";

interface StageStatusProps {
  stage: QueryStage;
}

export function StageStatus({ stage }: StageStatusProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-xs font-medium text-blue-600 dark:text-blue-400 select-none transition-all duration-300"
    >
      <span className="relative flex size-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full size-2 bg-blue-600 dark:bg-blue-400" />
      </span>
      <span>{stageLabel(stage)}</span>
    </div>
  );
}
