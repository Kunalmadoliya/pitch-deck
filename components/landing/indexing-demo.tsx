"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIndexingDemo } from "@/hooks/use-indexing-demo";
import { StageRail } from "./stage-rail";
import {
  ScanningView,
  ChunkingView,
  EmbeddingView,
  DoneView,
} from "./demo-views";

export function IndexingDemo() {
  const {
    stage,
    stageIndex,
    isPaused,
    setIsPaused,
    setStageIndex,
    isReducedMotion,
  } = useIndexingDemo();

  const isDone = stage === "Done";
  const isChunking = stage === "Chunking";
  const isEmbedding = stage === "Embedding" || stage === "Saving";
  const isScanning =
    stage === "Inspecting" || stage === "Extracting" || stage === "Queued";

  return (
    <section
      id="flow-demo"
      aria-label="How your data is indexed"
      className="max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-16"
    >
      {/* Max 5 words headline above it */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          How your data is indexed
        </h2>
      </div>

      {/* The Single Wide Product Mock Window */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Animated example of a document being indexed"
        className="relative rounded-3xl border border-stone-200/90 dark:border-stone-800/90 bg-white/70 dark:bg-stone-900/50 backdrop-blur-md shadow-xs overflow-hidden transition-all duration-300"
      >
        {/* Window Chrome Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-200/70 dark:border-stone-800/70 bg-stone-50/60 dark:bg-stone-900/40">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="size-2.5 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="size-2.5 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="ml-2 text-xs font-mono text-stone-600 dark:text-stone-300 truncate">
              Leave Policy.pdf
            </span>
          </div>

          {/* Morphing Status Pill */}
          <div className="flex items-center gap-2">
            {isPaused && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-stone-400">
                Paused
              </span>
            )}
            <motion.div
              layout
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-colors duration-300 ${
                isDone
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
              }`}
            >
              {isDone ? (
                <>
                  <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Indexed</span>
                </>
              ) : (
                <>
                  <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                  <span>Processing</span>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* 7-Stage Horizontal Step Rail */}
        <StageRail
          currentStage={stage}
          currentStageIndex={stageIndex}
          onSelectStage={setStageIndex}
        />

        {/* Main Dynamic Stage Display */}
        <div className="relative min-h-[280px] sm:min-h-[300px] p-6 sm:p-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isScanning && !isReducedMotion && <ScanningView stage={stage} />}
            {isChunking && !isReducedMotion && <ChunkingView />}
            {isEmbedding && !isReducedMotion && <EmbeddingView />}
            {(isDone || isReducedMotion) && <DoneView />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
