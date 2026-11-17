"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";

export type DemoStage =
  | "Queued"
  | "Inspecting"
  | "Extracting"
  | "Chunking"
  | "Embedding"
  | "Saving"
  | "Done";

export const DEMO_STAGES: DemoStage[] = [
  "Queued",
  "Inspecting",
  "Extracting",
  "Chunking",
  "Embedding",
  "Saving",
  "Done",
];

const STAGE_DURATIONS: Record<DemoStage, number> = {
  Queued: 1400,
  Inspecting: 2000,
  Extracting: 2400,
  Chunking: 2400,
  Embedding: 2400,
  Saving: 1800,
  Done: 2600,
};

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function useIndexingDemo() {
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const [stageIndex, setStageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveStageIndex = isReducedMotion
    ? DEMO_STAGES.length - 1
    : stageIndex;
  const currentStage = DEMO_STAGES[effectiveStageIndex];

  const advance = useCallback(() => {
    setStageIndex((prev) => (prev + 1) % DEMO_STAGES.length);
  }, []);

  useEffect(() => {
    if (isReducedMotion || isPaused) return;

    const duration = STAGE_DURATIONS[currentStage] || 2000;
    timerRef.current = setTimeout(advance, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStage, isPaused, isReducedMotion, advance]);

  return {
    stage: currentStage,
    stageIndex: effectiveStageIndex,
    stages: DEMO_STAGES,
    isPaused,
    setIsPaused,
    setStageIndex,
    isReducedMotion,
  };
}
