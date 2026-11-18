"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type DemoScene = "upload" | "ask";

export const UPLOAD_STAGES = [
  "Queued",
  "Inspecting",
  "Extracting",
  "Chunking",
  "Embedding",
  "Saving",
  "Done",
] as const;

export const ASK_STAGES = [
  "Optimizing query",
  "Guarding prompt",
  "Searching policy clauses",
  "Reranking matches",
  "Checking sources",
  "Composing answer",
] as const;

export const SAMPLE_QUESTION = "How many days of paid leave do I get?";
export const SAMPLE_ANSWER_WORDS = [
  "Full-time", "employees", "receive", "20", "days", "of", "paid",
  "annual", "leave", "accrued", "monthly", "[1],", "with", "up",
  "to", "5", "carryover", "days", "[2]."
];

export function useLandingDemo(initialScene: DemoScene = "upload") {
  const isAskInitial = initialScene === "ask";
  const [scene, setScene] = useState<DemoScene>(initialScene);
  const [uploadStageIndex, setUploadStageIndex] = useState(isAskInitial ? 0 : 3);
  const [askStageIndex, setAskStageIndex] = useState(isAskInitial ? ASK_STAGES.length - 1 : 0);
  const [typedChars, setTypedChars] = useState(isAskInitial ? SAMPLE_QUESTION.length : 0);
  const [streamedWordCount, setStreamedWordCount] = useState(isAskInitial ? SAMPLE_ANSWER_WORDS.length : 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const tickRef = useRef(isAskInitial ? 90 : 25);

  const switchScene = useCallback((target: DemoScene) => {
    setScene(target);
    if (target === "upload") {
      tickRef.current = 0;
      setUploadStageIndex(0);
    } else {
      tickRef.current = 0;
      setTypedChars(0);
      setAskStageIndex(0);
      setStreamedWordCount(0);
    }
  }, []);

  useEffect(() => {
    if (isReducedMotion) {
      setUploadStageIndex(UPLOAD_STAGES.length - 1);
      setTypedChars(SAMPLE_QUESTION.length);
      setAskStageIndex(ASK_STAGES.length - 1);
      setStreamedWordCount(SAMPLE_ANSWER_WORDS.length);
      return;
    }

    if (isPaused) return;

    const interval = window.setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;

      if (scene === "upload") {
        const stageIdx = Math.min(Math.floor(t / 11), UPLOAD_STAGES.length - 1);
        setUploadStageIndex(stageIdx);

        if (t >= 82) {
          switchScene("ask");
        }
      } else {
        if (t <= 22) {
          const charCount = Math.min(Math.floor((t / 22) * SAMPLE_QUESTION.length), SAMPLE_QUESTION.length);
          setTypedChars(charCount);
          setStreamedWordCount(0);
        } else if (t <= 52) {
          setTypedChars(SAMPLE_QUESTION.length);
          setStreamedWordCount(0);
          const sIdx = Math.min(Math.floor(((t - 23) / 29) * ASK_STAGES.length), ASK_STAGES.length - 1);
          setAskStageIndex(sIdx);
        } else if (t <= 88) {
          setTypedChars(SAMPLE_QUESTION.length);
          const wCount = Math.min(Math.floor(((t - 53) / 35) * SAMPLE_ANSWER_WORDS.length) + 1, SAMPLE_ANSWER_WORDS.length);
          setStreamedWordCount(wCount);
        } else if (t >= 120) {
          switchScene("upload");
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, isReducedMotion, scene, switchScene]);

  return {
    scene,
    setScene: switchScene,
    uploadStageIndex,
    uploadStage: UPLOAD_STAGES[uploadStageIndex],
    askStageIndex,
    askStage: ASK_STAGES[askStageIndex],
    typedChars,
    streamedWordCount,
    isPaused,
    setIsPaused,
    togglePause: () => setIsPaused((prev) => !prev),
    isReducedMotion,
  };
}
