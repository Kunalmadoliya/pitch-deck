"use client";

import React from "react";
import { motion } from "motion/react";
import { DemoStage } from "@/hooks/use-indexing-demo";

export const SAMPLE_CHUNKS = [
  { id: "c1", page: "p.1", title: "Annual Leave Accrual", vector: "•••··••·" },
  { id: "c2", page: "p.1", title: "Carryover Limits", vector: "·••··•••" },
  { id: "c3", page: "p.2", title: "Medical Certificates", vector: "••••··••" },
  { id: "c4", page: "p.2", title: "Notice Requirements", vector: "··••••··" },
];

export function ScanningView({ stage }: { stage: DemoStage }) {
  const label =
    stage === "Queued"
      ? "In queue"
      : stage === "Inspecting"
      ? "Detecting pages"
      : "Reading text layer";

  return (
    <motion.div
      key="scanning"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full max-w-md relative bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl p-6 overflow-hidden shadow-xs"
    >
      <motion.div
        animate={{ y: [0, 140, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 h-10 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 pointer-events-none"
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-stone-500">
          <span>Page 2 of 5</span>
          <span className="text-blue-600 dark:text-blue-400">{label}</span>
        </div>
        <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: stage === "Queued" ? "15%" : stage === "Inspecting" ? "45%" : "85%" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-blue-600 dark:bg-blue-400"
          />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full w-3/4" />
          <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full w-full" />
          <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full w-5/6" />
        </div>
      </div>
    </motion.div>
  );
}

export function ChunkingView() {
  return (
    <motion.div
      key="chunking"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-lg space-y-3"
    >
      <div className="text-center text-xs font-mono text-stone-400 mb-2">
        Segmenting by page boundary · No split clauses
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SAMPLE_CHUNKS.map((chunk, i) => (
          <motion.div
            key={chunk.id}
            layoutId={`chunk-${chunk.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 flex items-center justify-between text-xs"
          >
            <span className="font-medium text-stone-800 dark:text-stone-200">{chunk.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-700/70 font-mono text-[10px] text-stone-600 dark:text-stone-300">
              {chunk.page}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function EmbeddingView() {
  return (
    <motion.div
      key="embedding"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-6"
    >
      <div className="space-y-2 flex-1 w-full">
        <div className="text-xs font-mono text-stone-400 mb-1">Generating dense vectors (1536 dims)</div>
        {SAMPLE_CHUNKS.map((chunk, i) => (
          <motion.div
            key={chunk.id}
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className="p-2.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between text-xs font-mono"
          >
            <span className="text-stone-700 dark:text-stone-300 truncate max-w-[140px]">{chunk.title}</span>
            <span className="text-blue-600 dark:text-blue-400 text-[10px] tracking-widest">{chunk.vector}</span>
          </motion.div>
        ))}
      </div>
      <div className="text-stone-400 rotate-90 sm:rotate-0">→</div>
      <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-center w-full sm:w-44 shrink-0">
        <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7h16" />
          </svg>
        </div>
        <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">Vector Store</div>
        <div className="text-[11px] font-mono text-stone-500 mt-0.5">Isolated Namespace</div>
      </div>
    </motion.div>
  );
}

export function DoneView() {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-3"
    >
      <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Ready to search</h3>
        <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-1">
          Leave Policy.pdf · 4 clauses indexed across 2 pages
        </p>
      </div>
    </motion.div>
  );
}
