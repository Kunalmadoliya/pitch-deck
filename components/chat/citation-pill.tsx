"use client";

import React from "react";
import type { Citation } from "@/lib/api/chat-types";
import { PagePreviewTrigger } from "./page-preview";

interface CitationPillProps {
  citation: Citation;
  onSelect?: (citation: Citation) => void;
}

export function CitationPill({ citation, onSelect }: CitationPillProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(citation);
      return;
    }
    const target = document.getElementById(`source-item-${citation.n}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
      target.classList.add("ring-2", "ring-blue-500", "bg-blue-50/70", "dark:bg-blue-950/70");
      setTimeout(() => {
        target.classList.remove("ring-2", "ring-blue-500", "bg-blue-50/70", "dark:bg-blue-950/70");
      }, 1800);
    }
  };

  return (
    <PagePreviewTrigger citation={citation} className="relative inline-block mx-0.5 align-baseline">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Source ${citation.n}: ${citation.fileName}, page ${citation.pageNumber}`}
        className="inline-flex items-center justify-center min-w-4 h-4 px-1.5 text-[10px] font-mono font-semibold rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all cursor-pointer select-none"
      >
        {citation.n}
      </button>
    </PagePreviewTrigger>
  );
}
