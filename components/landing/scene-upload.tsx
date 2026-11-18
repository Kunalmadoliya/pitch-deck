"use client";

import React from "react";
import { motion } from "motion/react";
import { Database, Check, FileText } from "lucide-react";
import { StageRail } from "./stage-rail";

interface SceneUploadProps {
  stageIndex: number;
}

export function SceneUpload({ stageIndex }: SceneUploadProps) {
  const isScanning = stageIndex >= 1 && stageIndex <= 2;
  const isChunking = stageIndex === 3;
  const isEmbedding = stageIndex >= 4 && stageIndex <= 5;
  const isDone = stageIndex === 6;

  return (
    <div className="w-full space-y-5">
      <StageRail currentIndex={stageIndex} />

      <div className="relative min-h-[250px] sm:min-h-[280px] rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-3.5 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Top Doc Meta */}
        <div className="flex items-center justify-between text-xs text-stone-500 pb-3 border-b border-dashed border-stone-200 dark:border-stone-800/80 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <FileText className="size-3.5 text-stone-400 shrink-0" />
            <span className="font-medium text-stone-700 dark:text-stone-300 truncate">Leave Policy.pdf</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] sm:text-xs">Page 2 of 5</span>
            <div className="w-12 sm:w-16 h-1 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${Math.min(stageIndex * 16.6, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="relative my-auto py-3 flex flex-col items-center justify-center">
          {/* Scanning & text extraction */}
          {!isChunking && !isEmbedding && !isDone && (
            <div className="relative w-full max-w-sm mx-auto space-y-2 py-2">
              {isScanning && (
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-sm z-10"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <div className="h-2.5 w-3/4 rounded-full bg-stone-200 dark:bg-stone-700/80" />
              <div className="h-2.5 w-full rounded-full bg-stone-200 dark:bg-stone-700/80" />
              <div className="h-2.5 w-5/6 rounded-full bg-stone-200 dark:bg-stone-700/80" />
              <div className="h-2.5 w-2/3 rounded-full bg-stone-200 dark:bg-stone-700/80" />
            </div>
          )}

          {/* Chunking: Split into clause chips with page labels */}
          {isChunking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-wrap items-center justify-center gap-2 max-w-md w-full"
            >
              {[
                { label: "p.1", text: "Annual leave entitlement" },
                { label: "p.1", text: "Accrual rate per month" },
                { label: "p.2", text: "Carryover limit (5 days)" },
                { label: "p.2", text: "Manager approval timeline" },
              ].map((c) => (
                <div
                  key={c.text}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-dotted border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 shadow-2xs max-w-full"
                >
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-mono shrink-0">
                    {c.label}
                  </span>
                  <span className="truncate">{c.text}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Embedding: Chips fly toward vector store */}
          {isEmbedding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-4 sm:gap-6"
            >
              <div className="space-y-1.5">
                {["p.1 vector", "p.2 vector"].map((v, i) => (
                  <motion.div
                    key={v}
                    animate={{ x: [0, 30, 45], opacity: [1, 0.8, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-xs text-blue-600 dark:text-blue-400 font-mono"
                  >
                    <span className="size-1.5 rounded-full bg-blue-500 animate-ping" />
                    <span>{v}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs shrink-0">
                <Database className="size-4 sm:size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium">Vector store</span>
              </div>
            </motion.div>
          )}

          {/* Done: Indexed & Ready to ask */}
          {isDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-900">
                <Check className="size-3.5 stroke-[3]" />
                <span>Indexed into Pinecone</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Ready to ask questions with citations.
              </p>
            </motion.div>
          )}
        </div>

        {/* Bottom Status Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-stone-400 pt-2 border-t border-dashed border-stone-200/60 dark:border-stone-800/60">
          <span className="truncate">{isDone ? "5 pages processed" : "Processing text layers and scans..."}</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium shrink-0">
            {isDone ? "Complete" : "Inngest background step"}
          </span>
        </div>
      </div>
    </div>
  );
}
