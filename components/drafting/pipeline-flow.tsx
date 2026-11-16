"use client";

import React, { useState, useEffect } from "react";

interface StageInfo {
  id: string;
  number: string;
  title: string;
  tagline: string;
  detail: string;
  metric: string;
  sample: string;
}

const STAGES: StageInfo[] = [
  {
    id: "docs",
    number: "01",
    title: "Documents In",
    tagline: "Lossless Ingestion",
    detail:
      "Raw company handbooks, compliance manuals, vendor SLAs, and NDAs in PDF or Word are ingested without pre-formatting.",
    metric: "Lossless layout extraction",
    sample: "acme_global_handbook_2026.pdf (142 pages)",
  },
  {
    id: "chunking",
    number: "02",
    title: "Parsing & Chunking",
    tagline: "Semantic Segmentation",
    detail:
      "Documents are segmented along natural clause and chapter boundaries rather than arbitrary token cuts, keeping legal context intact.",
    metric: "Hierarchy & header tree preserved",
    sample: "§4.2.1 'Workstation Hardware & Screen Lockout'",
  },
  {
    id: "embeddings",
    number: "03",
    title: "Embeddings",
    tagline: "Dense Vector Mapping",
    detail:
      "Each policy chunk is mapped into high-dimensional vector space capturing regulatory intent, obligations, and exceptions.",
    metric: "1536-dim semantic representation",
    sample: "vec: [-0.024, 0.118, ..., 0.089] + metadata tags",
  },
  {
    id: "store",
    number: "04",
    title: "Vector Store",
    tagline: "Tenant-Isolated Index",
    detail:
      "Vectors and source metadata are stored in an encrypted namespace tied strictly to your company account with sub-second lookups.",
    metric: "Cryptographic tenant partitioning",
    sample: "Namespace: tenant_usr_981a // HNSW indexed",
  },
  {
    id: "retrieval",
    number: "05",
    title: "Hybrid Retrieval",
    tagline: "BM25 + Vector Fusion",
    detail:
      "Queries execute both sparse keyword matching and dense semantic search, followed by cross-encoder reranking that filters out false positives.",
    metric: "Top-5 precision @ 99.4%",
    sample: "RRF score: 0.942 -> Cross-encoder pass: verified",
  },
  {
    id: "answer",
    number: "06",
    title: "Grounded Answer",
    tagline: "Cited Policy Output",
    detail:
      "The LLM synthesizes an unambiguous rule statement backed by exact page, paragraph, and line citations directly from your original document.",
    metric: "100% grounded // Zero hallucination",
    sample: "Rule #SEC-08: Page 14 §3.2 (AES-256 mandatory)",
  },
];

export function PipelineFlow() {
  const [activeStage, setActiveStage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance loop every 3 seconds unless paused
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const current = STAGES[activeStage];

  return (
    <div
      className="w-full space-y-7"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header without harsh dividing lines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
            <span className="tracking-wide uppercase text-[10.5px]">
              Interactive Architecture Walkthrough
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 mt-2 font-semibold tracking-tight">
            The 6-Stage Policy Extraction Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
          <span className="px-3 py-1 rounded-full bg-stone-100/70 dark:bg-stone-800/50">
            Click node to inspect
          </span>
          <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            [{activeStage + 1}/6]
          </span>
        </div>
      </div>

      {/* 6 Stage Node Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map((stage, idx) => {
          const isActive = idx === activeStage;
          const isCompleted = idx < activeStage;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => {
                setActiveStage(idx);
                setIsPaused(true);
              }}
              className={`relative text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                  : isCompleted
                  ? "bg-white/70 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800"
                  : "bg-stone-100/60 dark:bg-stone-900/40 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900"
              }`}
            >
              {/* Node Top: Number & Indicator */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-mono text-xs font-bold ${
                    isActive ? "text-blue-100" : "text-stone-400 dark:text-stone-500"
                  }`}
                >
                  {stage.number}
                </span>

                <span
                  className={`size-2 rounded-full transition-all ${
                    isActive
                      ? "bg-white ring-2 ring-white/40 animate-pulse"
                      : isCompleted
                      ? "bg-blue-600 dark:bg-blue-400"
                      : "bg-stone-300 dark:bg-stone-700"
                  }`}
                />
              </div>

              <div
                className={`text-sm sm:text-base font-semibold leading-snug ${
                  isActive ? "text-white" : "text-stone-900 dark:text-stone-100"
                }`}
              >
                {stage.title}
              </div>

              <div
                className={`mt-1 text-[11px] truncate ${
                  isActive ? "text-blue-100" : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {stage.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Deep Dive (Clean floating card without nested lines) */}
      <div className="rounded-2xl bg-white/60 dark:bg-stone-900/40 p-6 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Plain-English Description */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60">
              Stage {current.number}
            </span>
            <span className="text-stone-300 dark:text-stone-700 select-none">•</span>
            <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">
              {current.tagline}
            </span>
          </div>

          <h4 className="text-xl sm:text-2xl text-stone-900 dark:text-stone-100 font-bold tracking-tight">
            {current.title}
          </h4>

          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {current.detail}
          </p>

          <div className="pt-1 flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
            <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            <span>Metric: {current.metric}</span>
          </div>
        </div>

        {/* Right Column: Code-Built Live Buffer (Clean rounded pill surface) */}
        <div className="md:col-span-5 p-4 rounded-xl bg-stone-100/70 dark:bg-stone-950/50 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-[11px]">
            <span>Active Pipeline Buffer</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Live Output</span>
          </div>

          <div className="text-stone-800 dark:text-stone-200 text-[11.5px] leading-relaxed break-all font-medium">
            &gt; {current.sample}
          </div>

          <div className="text-[10px] text-stone-400 flex justify-between pt-1">
            <span>Latency: 12ms</span>
            <span className="text-green-600 dark:text-green-400">Integrity: 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
