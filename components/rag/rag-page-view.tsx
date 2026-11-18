"use client";

import React from "react";
import Link from "next/link";
import { useDocuments } from "@/hooks/use-documents";
import { Dropzone } from "./dropzone";
import { DocumentList } from "./document-list";

export function RagPageView() {
  const { data: documents } = useDocuments();

  const total = documents?.length ?? 0;
  const indexed = documents?.filter((d) => d.status === "INDEXED").length ?? 0;
  const processing = documents?.filter((d) => d.status === "PROCESSING" || d.status === "UPLOADED").length ?? 0;
  const failed = documents?.filter((d) => d.status === "FAILED").length ?? 0;

  const stats = total > 0
    ? `${total} documents · ${indexed} indexed · ${processing} processing${failed > 0 ? ` · ${failed} failed` : ""}`
    : "No documents in index";

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Header with Navigation & Inline Stats */}
      <section aria-label="RAG Document Header" className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
          <Link
            href="/dashboard"
            className="hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-full bg-stone-100/70 dark:bg-stone-800/70 transition-colors"
          >
            ← Overview
          </Link>
          <span className="text-stone-300 dark:text-stone-700 select-none">•</span>
          <span className="text-stone-400">Grounded Knowledge Base</span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Document RAG
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
            Upload enterprise handbooks, compliance manuals, and vendor SLAs. Text layers and scanned pages are extracted, chunked along clause boundaries, and indexed into Pinecone.
          </p>
        </div>

        <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-medium">
          {stats}
        </div>
      </section>

      {/* ONE Large Dashed Dropzone */}
      <section aria-label="Upload Dropzone">
        <Dropzone />
      </section>

      {/* Active 'Ask Your Documents' Link */}
      <section aria-label="Query Feature Link">
        <Link
          href="/dashboard/rag/chat"
          className="group p-4 sm:p-5 rounded-3xl border border-stone-200/90 dark:border-stone-800/90 bg-white dark:bg-stone-900/60 hover:border-blue-500/60 dark:hover:border-blue-400/60 hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-8 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-sm text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Ask your policies
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Ask natural questions across your documents with page-level citations.
              </div>
            </div>
          </div>
          <span className="whitespace-nowrap px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-medium self-start sm:self-auto group-hover:bg-blue-700 transition-colors shrink-0">
            Open chat →
          </span>
        </Link>
      </section>

      {/* Hairline Divider List */}
      <section aria-label="Indexed Documents">
        <DocumentList />
      </section>
    </div>
  );
}
