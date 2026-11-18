"use client";

import React, { useState } from "react";
import type { Citation } from "@/lib/api/chat-types";

interface CitationPillProps {
  citation: Citation;
  onSelect?: (citation: Citation) => void;
}

export function CitationPill({ citation, onSelect }: CitationPillProps) {
  const [hovered, setHovered] = useState(false);

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
    <span className="relative inline-block mx-0.5 align-baseline">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`Source ${citation.n}: ${citation.fileName}, page ${citation.pageNumber}`}
        className="inline-flex items-center justify-center min-w-4 h-4 px-1.5 text-[10px] font-mono font-semibold rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all cursor-pointer select-none"
      >
        {citation.n}
      </button>

      {hovered && (
        <span
          role="tooltip"
          className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs shadow-xl border border-stone-200 dark:border-stone-800 whitespace-nowrap pointer-events-none transition-all"
        >
          <span className="block font-medium truncate max-w-xs">{citation.fileName}</span>
          <span className="block text-[10px] text-stone-400 font-mono mt-0.5">
            Page {citation.pageNumber} · Chunk {citation.chunkIndex + 1}
          </span>
        </span>
      )}
    </span>
  );
}
