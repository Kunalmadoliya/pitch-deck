"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { FileText, ArrowUp } from "lucide-react";
import { ASK_STAGES, SAMPLE_QUESTION, SAMPLE_ANSWER_WORDS } from "@/hooks/use-landing-demo";

interface SceneAskProps {
  typedChars: number;
  askStageIndex: number;
  streamedWordCount: number;
}

const SOURCES = [
  { n: 1, name: "Leave Policy.pdf", page: 7 },
  { n: 2, name: "Remote Work Policy.pdf", page: 3 },
];

export function SceneAsk({ typedChars, askStageIndex, streamedWordCount }: SceneAskProps) {
  const [activeSource, setActiveSource] = useState<number | null>(null);

  const isTyping = typedChars < SAMPLE_QUESTION.length;
  const isPipelining = !isTyping && streamedWordCount === 0;
  const showSources = streamedWordCount >= SAMPLE_ANSWER_WORDS.length;

  return (
    <div className="w-full space-y-4">
      <div className="relative min-h-[250px] sm:min-h-[280px] rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        <div className="space-y-4">
          {!isTyping && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
              <div className="max-w-[85%] px-4 py-2.5 rounded-2xl bg-stone-200/80 dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-medium shadow-2xs border border-stone-200/50 dark:border-stone-700/50">
                {SAMPLE_QUESTION}
              </div>
            </motion.div>
          )}

          {isPipelining && (
            <motion.div key={askStageIndex} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-900/60 text-xs text-blue-600 dark:text-blue-400 font-sans">
              <span className="size-2 rounded-full bg-blue-600 animate-ping" />
              <span>{ASK_STAGES[askStageIndex]}</span>
            </motion.div>
          )}

          {streamedWordCount > 0 && (
            <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
              {SAMPLE_ANSWER_WORDS.slice(0, streamedWordCount).map((word, i) => {
                const hasOne = word.includes("[1]");
                const hasTwo = word.includes("[2]");
                if (hasOne || hasTwo) {
                  const num = hasOne ? 1 : 2;
                  const isHigh = activeSource === num;
                  return (
                    <span key={i}>
                      {" "}
                      <button
                        type="button"
                        onMouseEnter={() => setActiveSource(num)}
                        onMouseLeave={() => setActiveSource(null)}
                        className={`inline-flex items-center justify-center size-4 text-[10px] font-mono font-medium rounded-full cursor-pointer transition-all ${
                          isHigh
                            ? "bg-blue-600 text-white scale-110"
                            : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60"
                        }`}
                      >
                        {num}
                      </button>
                      {word.replace(/\[\d+\]/, "")}
                    </span>
                  );
                }
                return (i === 0 ? "" : " ") + word;
              })}
            </p>
          )}
        </div>

        {showSources && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pt-3 border-t border-dashed border-stone-200 dark:border-stone-800 space-y-2">
            <div className="text-[11px] font-medium text-stone-400 flex items-center justify-between">
              <span>Sources (2)</span>
              <span className="text-[10px] text-stone-400 hidden sm:inline">Hover citation to highlight source</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOURCES.map((src) => {
                const isHigh = activeSource === src.n;
                return (
                  <div
                    key={src.n}
                    onMouseEnter={() => setActiveSource(src.n)}
                    onMouseLeave={() => setActiveSource(null)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isHigh
                        ? "bg-blue-50/90 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100 shadow-2xs"
                        : "border-stone-200/70 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-medium size-4 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                        {src.n}
                      </span>
                      <FileText className="size-3 text-stone-400 shrink-0" />
                      <span className="text-xs truncate font-medium">{src.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-2">Page {src.page}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between p-2 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-2xs min-w-0">
        <span className="text-xs text-stone-700 dark:text-stone-300 px-3 truncate flex-1 min-w-0 font-sans">
          {isTyping ? (
            <span>
              {SAMPLE_QUESTION.slice(0, typedChars)}
              <span className="inline-block w-0.5 h-3.5 bg-blue-600 align-middle ml-0.5 animate-pulse" />
            </span>
          ) : (
            <span className="text-stone-400">Ask a follow-up question...</span>
          )}
        </span>
        <div className={`size-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isTyping ? "bg-blue-600 text-white" : "bg-stone-200 dark:bg-stone-700 text-stone-400"
        }`}>
          <ArrowUp className="size-3.5" />
        </div>
      </div>
    </div>
  );
}
