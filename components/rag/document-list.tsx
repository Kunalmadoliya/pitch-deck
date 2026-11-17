"use client";

import React from "react";
import { useDocuments } from "@/hooks/use-documents";
import { DocumentRow } from "./document-row";

export function DocumentList() {
  const { data: documents, isLoading, isError, error, refetch } = useDocuments();

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4" aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="py-4 border-b border-stone-200/50 dark:border-stone-800/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-stone-200/60 dark:bg-stone-800/60 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3.5 w-44 bg-stone-200/60 dark:bg-stone-800/60 rounded-full animate-pulse" />
                <div className="h-2.5 w-24 bg-stone-200/60 dark:bg-stone-800/60 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-20 bg-stone-200/60 dark:bg-stone-800/60 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center space-y-3 border-b border-dotted border-stone-200 dark:border-stone-800">
        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-mono">
          {error?.message || "Failed to load documents."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs font-medium px-4 py-1.5 rounded-full border border-dotted border-stone-300 dark:border-stone-700 hover:border-blue-600 transition-colors"
        >
          Retry loading
        </button>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="py-16 text-center border-b border-dotted border-stone-200 dark:border-stone-800 space-y-2">
        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          No policies indexed yet
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto font-mono">
          Upload employee handbooks, customer agreements, or security policies using the drop zone above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1" aria-label="Policy documents list">
      <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between border-b border-dotted border-stone-200 dark:border-stone-800">
        <span>Document Name & Citations</span>
        <span>Status</span>
      </div>

      <div className="divide-y divide-stone-200/40 dark:divide-stone-800/40">
        {documents.map((doc) => (
          <DocumentRow key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}
