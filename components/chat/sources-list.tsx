"use client";

import React from "react";
import { FileText } from "lucide-react";
import type { Citation } from "@/lib/api/chat-types";

interface SourcesListProps {
  citations: Citation[];
}

export function SourcesList({ citations }: SourcesListProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-5 pt-3.5 border-t border-dashed border-stone-200 dark:border-stone-800 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-stone-500 dark:text-stone-400">
          Sources referenced ({citations.length})
        </span>
        <span className="text-[11px] text-stone-400 hidden sm:inline">
          Click citation number to highlight
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {citations.map((c) => (
          <div
            key={`${c.n}-${c.documentId}-${c.pageNumber}`}
            id={`source-item-${c.n}`}
            className="group p-2.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 shadow-2xs space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-4.5 rounded-full flex items-center justify-center text-[10px] font-mono font-medium bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                  {c.n}
                </span>
                <FileText className="size-3.5 text-stone-400 shrink-0" />
                <span className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate">
                  {c.fileName}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-stone-500 dark:text-stone-400">
                <span className="px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800">
                  Page {c.pageNumber}
                </span>
                <span className="opacity-60 hidden sm:inline">
                  c.{c.chunkIndex + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
