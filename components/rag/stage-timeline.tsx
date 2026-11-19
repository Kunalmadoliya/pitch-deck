"use client";

import React from "react";
import { useDocument } from "@/hooks/use-document";
import { IndexingStage, formatIndexingDuration } from "@/lib/api/documents";

interface StageTimelineProps {
  documentId: string;
  initialStage: IndexingStage;
}

const STAGES: { key: IndexingStage; label: string; desc: string }[] = [
  { key: "QUEUED", label: "Queued", desc: "Awaiting background worker" },
  { key: "INSPECTING", label: "Inspecting", desc: "Validating pages and layout" },
  { key: "EXTRACTING", label: "Reading & indexing pages", desc: "Each page is read (OCR for scans), split into clauses and made searchable right away" },
  { key: "DONE", label: "Ready", desc: "Indexed and ready for RAG queries" },
];

export function StageTimeline({ documentId, initialStage }: StageTimelineProps) {
  const { data: document } = useDocument(documentId);
  const rawStage = document?.stage || initialStage;
  // Older documents may still report the stages from the previous step-by-step pipeline.
  const currentStage: IndexingStage =
    rawStage === "CHUNKING" || rawStage === "EMBEDDING" || rawStage === "UPSERTING" ? "EXTRACTING" : rawStage;
  const duration = document ? formatIndexingDuration(document) : null;
  const isFailed = document?.status === "FAILED";

  const stageOrder = STAGES.map((s) => s.key);
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="py-4 pl-4 pr-2 sm:pl-8 space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between text-stone-500 font-mono text-[11px]">
        <span>Pipeline Progress</span>
        {document?.pageCount && (
          <span>
            {document.pagesProcessed} of {document.pageCount} pages processed ({document.chunkCount} clauses)
            {duration && <> · {duration}</>}
          </span>
        )}
      </div>

      <div className="relative border-l border-dotted border-stone-300 dark:border-stone-700 ml-2 space-y-4 pl-5">
        {STAGES.map((s, idx) => {
          const isDone = currentIndex > idx || currentStage === "DONE";
          const isCurrent = currentIndex === idx && currentStage !== "DONE";

          let dotClass = "bg-stone-300 dark:bg-stone-700";
          if (isFailed && isCurrent) {
            dotClass = "bg-red-500 ring-4 ring-red-100 dark:ring-red-950/60";
          } else if (isCurrent) {
            dotClass = "bg-blue-600 dark:bg-blue-400 ring-4 ring-blue-100 dark:ring-blue-950/60 animate-pulse";
          } else if (isDone) {
            dotClass = "bg-emerald-500";
          }

          return (
            <div key={s.key} className="relative flex items-start justify-between">
              <span
                className={`absolute -left-[25px] top-1 size-2 rounded-full transition-all ${dotClass}`}
              />
              <div>
                <span
                  className={`font-medium block leading-tight ${
                    isCurrent
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : isDone
                      ? "text-stone-900 dark:text-stone-100"
                      : "text-stone-400 dark:text-stone-600"
                  }`}
                >
                  {s.label}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5">
                  {s.desc}
                </span>
              </div>

              {isCurrent && !isFailed && (
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60">
                  In progress
                </span>
              )}
            </div>
          );
        })}
      </div>

      {isFailed && document?.errorMessage && (
        <div className="mt-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-xs">
          <span className="font-semibold">Failure reason: </span>
          {document.errorMessage}
        </div>
      )}
    </div>
  );
}
