import React from "react";
import type { DeckStatus } from "@/lib/api/decks";

const CONFIG: Record<DeckStatus, { label: string; dot: string; tone: string }> = {
  PENDING: {
    label: "Queued",
    dot: "bg-amber-500",
    tone: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40",
  },
  GENERATING: {
    label: "Writing slides",
    dot: "bg-blue-600 dark:bg-blue-400 animate-pulse",
    tone: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40",
  },
  COMPLETE: {
    label: "Ready",
    dot: "bg-emerald-600 dark:bg-emerald-400",
    tone: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40",
  },
  FAILED: {
    label: "Failed",
    dot: "bg-red-500",
    tone: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200/60 dark:border-red-800/40",
  },
};

export function DeckStatusPill({ status }: { status: DeckStatus }) {
  const config = CONFIG[status] ?? CONFIG.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border shrink-0 ${config.tone}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
