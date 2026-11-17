"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useDocuments } from "@/hooks/use-documents";
import { StatusPill } from "@/components/rag/status-pill";
import { formatBytes } from "@/lib/api/documents";

export function RecentDocumentsList() {
  const { data: documents, isLoading, isError } = useDocuments();

  if (isLoading) {
    return (
      <div className="space-y-4 pt-6">
        <div className="h-4 w-32 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 w-full border-b border-stone-200/50 dark:border-stone-800/50 flex items-center justify-between"
            >
              <div className="h-3 w-48 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
              <div className="h-3 w-20 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-6 text-xs text-stone-500 font-mono">
        Unable to load recent documents. Check your connection.
      </div>
    );
  }

  const recent = documents?.slice(0, 5) || [];

  return (
    <div className="space-y-3 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Recent documents
        </h2>
        {documents && documents.length > 0 && (
          <Link
            href="/dashboard/rag"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View all ({documents.length}) →
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="py-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dotted border-stone-200 dark:border-stone-800">
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            No policies uploaded yet. Ingest your first handbook or vendor SLA.
          </p>
          <Link
            href="/dashboard/rag"
            className="inline-flex items-center justify-center text-xs font-medium px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
          >
            Upload policy →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
          {recent.map((doc) => {
            const uploadedAgo = formatDistanceToNow(new Date(doc.createdAt), {
              addSuffix: true,
            });

            return (
              <Link
                key={doc.id}
                href="/dashboard/rag"
                className="group flex items-center justify-between py-3.5 hover:bg-stone-100/40 dark:hover:bg-stone-900/40 px-2 -mx-2 rounded-xl transition-colors"
              >
                <div className="min-w-0 pr-4 flex items-center gap-3">
                  <div className="size-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs shrink-0 font-mono">
                    {doc.mimeType === "application/pdf" ? "PDF" : "IMG"}
                  </div>
                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate block">
                      {doc.fileName}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      {formatBytes(doc.sizeBytes)} · {uploadedAgo}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <StatusPill status={doc.status} />
                  <span className="text-stone-400 text-xs hidden sm:inline" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
