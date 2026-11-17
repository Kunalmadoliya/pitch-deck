import React from "react";
import { DocumentStatus, statusLabel } from "@/lib/api/documents";

interface StatusPillProps {
  status: DocumentStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const configs = {
    UPLOADED: {
      dot: "bg-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200/60 dark:border-amber-800/40",
    },
    PROCESSING: {
      dot: "bg-blue-600 dark:bg-blue-400 animate-pulse",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200/60 dark:border-blue-800/40",
    },
    INDEXED: {
      dot: "bg-emerald-600 dark:bg-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200/60 dark:border-emerald-800/40",
    },
    FAILED: {
      dot: "bg-red-500",
      bg: "bg-red-50 dark:bg-red-950/40",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-200/60 dark:border-red-800/40",
    },
  };

  const config = configs[status] || configs.UPLOADED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${config.bg} ${config.text} ${config.border} transition-colors`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      <span>{statusLabel(status)}</span>
    </span>
  );
}
