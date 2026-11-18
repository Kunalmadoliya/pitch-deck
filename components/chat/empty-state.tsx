"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  "What is our remote work and equipment expense policy?",
  "How many vacation and carryover days are allowed per year?",
  "Summarize key data security and compliance requirements.",
];

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const { data: documents } = useDocuments();
  const indexedCount = documents?.filter((d) => d.status === "INDEXED").length ?? 0;

  return (
    <div className="py-12 sm:py-20 text-center max-w-lg mx-auto space-y-8 animate-fadeIn">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium border border-stone-200/60 dark:border-stone-700/60">
          <ShieldCheck className="size-3.5 text-blue-600 dark:text-blue-400" />
          <span>Verified Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Ask your policies
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-md mx-auto">
          Ask questions across your enterprise handbooks and agreements. Every answer points directly to verified pages.
        </p>
      </div>

      {indexedCount === 0 ? (
        <div className="p-5 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 text-xs text-stone-600 dark:text-stone-400 space-y-2">
          <p>No documents have been indexed into Pinecone yet.</p>
          <Link
            href="/dashboard/rag"
            className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Upload policies in Document RAG <ArrowUpRight className="size-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5 text-left">
          <p className="text-xs font-medium text-stone-400 text-center">Suggested queries</p>
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 hover:border-blue-400/80 dark:hover:border-blue-500/60 hover:bg-stone-50 dark:hover:bg-stone-850/80 text-xs sm:text-sm text-stone-700 dark:text-stone-300 transition-all cursor-pointer shadow-2xs"
              >
                <span className="font-medium truncate">{prompt}</span>
                <ArrowUpRight className="size-3.5 text-stone-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
