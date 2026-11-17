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

      {/* Subtle Disabled 'Ask Your Documents' Hint */}
      <section aria-label="Query Feature Preview">
        <div className="p-4 rounded-2xl border border-dotted border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-stone-500 dark:text-stone-400">
            <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="font-medium text-stone-700 dark:text-stone-300">
              Ask your policies (Semantic Retrieval & Citations)
            </span>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 self-start sm:self-auto select-none">
            Query Engine Coming Soon
          </span>
        </div>
      </section>

      {/* Hairline Divider List */}
      <section aria-label="Indexed Documents">
        <DocumentList />
      </section>
    </div>
  );
}
