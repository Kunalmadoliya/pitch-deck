"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { DocumentItem, formatBytes, stageLabel } from "@/lib/api/documents";
import { StatusPill } from "./status-pill";
import { StageTimeline } from "./stage-timeline";
import { useDeleteDocument } from "@/hooks/use-delete-document";

interface DocumentRowProps {
  document: DocumentItem;
}

export function DocumentRow({ document: doc }: DocumentRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteMutation = useDeleteDocument();

  const isProcessing = doc.status === "PROCESSING" || doc.status === "UPLOADED";
  const isFailed = doc.status === "FAILED";
  const isIndexed = doc.status === "INDEXED";

  const progressPercent = doc.pageCount && doc.pageCount > 0
    ? Math.min(100, Math.round((doc.pagesProcessed / doc.pageCount) * 100))
    : doc.status === "INDEXED" ? 100 : 15;

  const uploadedAgo = formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(doc.id);
    } catch { /* Handled in mutation error state */ }
  };

  return (
    <div className="border-b border-stone-200/70 dark:border-stone-800/70 transition-colors">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setIsExpanded(!isExpanded)}
        className="group flex flex-col sm:flex-row sm:items-center justify-between py-4 px-2 hover:bg-stone-50/60 dark:hover:bg-stone-900/40 rounded-xl cursor-pointer transition-colors gap-3"
      >
        {/* Left: Icon & Title */}
        <div className="min-w-0 flex items-center gap-3">
          <div className="size-9 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center text-xs font-mono shrink-0 shadow-xs">
            {doc.mimeType === "application/pdf" ? "PDF" : "IMG"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {doc.fileName}
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                {isExpanded ? "▲" : "▼"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-stone-400 mt-0.5">
              <span>{formatBytes(doc.sizeBytes)}</span>
              <span>•</span>
              <span>{uploadedAgo}</span>
              {isIndexed && doc.pageCount && (
                <>
                  <span>•</span>
                  <span>{doc.pageCount} pages, {doc.chunkCount} clauses</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusPill status={doc.status} />

          {confirmDelete ? (
            <div className="flex items-center gap-2 animate-pop-in">
              <span className="text-xs text-stone-500 font-mono">Delete?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs font-medium px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-full text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              aria-label="Delete document"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Thin Processing Progress Bar */}
      {isProcessing && (
        <div className="px-2 pb-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 mb-1">
            <span>{stageLabel(doc.stage)}</span>
            {doc.pageCount ? <span>{doc.pagesProcessed} of {doc.pageCount} pages</span> : <span>Preparing</span>}
          </div>
          <div className="h-1 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {/* Friendly Failed Note */}
      {isFailed && (
        <div className="px-2 pb-3 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>Processing halted: {doc.errorMessage || "Validation failed"}. Delete and re-upload to retry.</span>
        </div>
      )}

      {/* Delete Error Notification (502 / retry) */}
      {deleteMutation.isError && (
        <div className="px-2 pb-2 text-xs text-red-600 dark:text-red-400 font-mono">
          {deleteMutation.error?.message || "Delete failed. Please retry."}
        </div>
      )}

      {/* Inline Expanded Stage Timeline */}
      {isExpanded && <StageTimeline documentId={doc.id} initialStage={doc.stage} />}
    </div>
  );
}
