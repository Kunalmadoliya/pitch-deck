"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause } from "lucide-react";
import { useLandingDemo, type DemoScene } from "@/hooks/use-landing-demo";
import { SceneUpload } from "./scene-upload";
import { SceneAsk } from "./scene-ask";

interface DemoWindowProps {
  initialScene?: DemoScene;
}

export function DemoWindow({ initialScene = "upload" }: DemoWindowProps) {
  const {
    scene,
    setScene,
    uploadStageIndex,
    askStageIndex,
    typedChars,
    streamedWordCount,
    isPaused,
    setIsPaused,
    togglePause,
  } = useLandingDemo(initialScene);

  return (
    <section
      id="flow-demo"
      aria-label="Product Demo"
      className="max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-20"
    >
      {/* 5 words max headline, no paragraph text */}
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          From document to cited answer
        </h2>
      </div>

      {/* The ONLY card-like surface on the entire landing page */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Animated example: a document is indexed, then a question is answered with sources"
        className="relative rounded-3xl border border-stone-200/90 dark:border-stone-800/90 bg-white/80 dark:bg-stone-900/60 backdrop-blur-md shadow-xs p-4 sm:p-7 overflow-hidden transition-all duration-300"
      >
        {/* Top Control Bar: Segmented Pill + Pause Button */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-dashed border-stone-200/80 dark:border-stone-800/80">
          {/* Segmented control: Upload & Ask */}
          <div className="inline-flex items-center p-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60">
            <button
              type="button"
              onClick={() => setScene("upload")}
              className={`px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all ${
                scene === "upload"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setScene("ask")}
              className={`px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all ${
                scene === "ask"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              Ask
            </button>
          </div>

          {/* Pause / Play accessibility button */}
          <button
            type="button"
            onClick={togglePause}
            aria-label={isPaused ? "Resume animation" : "Pause animation"}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
          >
            {isPaused ? <Play className="size-3 fill-current" /> : <Pause className="size-3 fill-current" />}
            <span className="hidden sm:inline">{isPaused ? "Play" : "Pause"}</span>
          </button>
        </div>

        {/* Dynamic Scene Content */}
        <div className="relative min-h-[300px] sm:min-h-[320px] flex items-center w-full">
          <AnimatePresence mode="wait" initial={false}>
            {scene === "upload" ? (
              <motion.div
                key="scene-upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <SceneUpload stageIndex={uploadStageIndex} />
              </motion.div>
            ) : (
              <motion.div
                key="scene-ask"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <SceneAsk
                  typedChars={typedChars}
                  askStageIndex={askStageIndex}
                  streamedWordCount={streamedWordCount}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
