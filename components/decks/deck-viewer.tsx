"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Copy, Check, Maximize2, Trash2, ImageIcon } from "lucide-react";
import { useDeck, useDeleteDeck } from "@/hooks/use-decks";
import { isDeckBusy, type DeckDetail } from "@/lib/api/decks";
import { DeckStatusPill } from "./deck-status-pill";
import { SlideCard, slideBullets } from "./slide-card";

const STEPS = ["Checking your idea", "Writing the slides", "Quality check", "Saving the deck"];

function deckAsText(deck: DeckDetail): string {
  const lines = [deck.title ?? "Pitch deck", ""];
  deck.slides.forEach((slide, i) => {
    lines.push(`${i + 1}. ${slide.title}`);
    slideBullets(slide.content).forEach((b) => lines.push(`   • ${b}`));
    lines.push("");
  });
  return lines.join("\n").trim();
}

export function DeckViewer({ deckId }: { deckId: string }) {
  const router = useRouter();
  const { data: deck, isLoading, error } = useDeck(deckId);
  const deleteDeck = useDeleteDeck();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
        <Link
          href="/dashboard/decks"
          className="hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-full bg-stone-100/70 dark:bg-stone-800/70 transition-colors"
        >
          ← All decks
        </Link>
      </div>

      {isLoading && <div className="aspect-video w-full rounded-3xl bg-stone-100/70 dark:bg-stone-900/60 animate-pulse" />}

      {error && (
        <div className="rounded-3xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 p-6 text-sm text-red-700 dark:text-red-300">
          {error.message}
        </div>
      )}

      {deck && (
        <>
          <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 truncate">
                  {deck.title ?? "New pitch deck"}
                </h1>
                <DeckStatusPill status={deck.status} />
              </div>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl line-clamp-2" title={deck.idea}>
                {deck.idea}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm("Delete this deck? This cannot be undone.")) return;
                deleteDeck.mutate(deck.id, { onSuccess: () => router.push("/dashboard/decks") });
              }}
              className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-xs text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          </header>

          {isDeckBusy(deck.status) && <GeneratingState status={deck.status} />}

          {deck.status === "FAILED" && (
            <div className="rounded-3xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 p-6 space-y-3">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">This deck could not be generated</p>
              <p className="text-xs text-red-700/80 dark:text-red-300/80">
                {deck.errorMessage ?? "Something went wrong while writing the slides."}
              </p>
              <Link
                href="/dashboard/decks"
                className="inline-block text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try again with a more detailed idea →
              </Link>
            </div>
          )}

          {deck.status === "COMPLETE" && deck.slides.length > 0 && <SlidePlayer deck={deck} />}
        </>
      )}
    </div>
  );
}

function GeneratingState({ status }: { status: DeckDetail["status"] }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (status !== "GENERATING") return;
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 6000);
    return () => clearInterval(timer);
  }, [status]);
  const active = status === "PENDING" ? -1 : step;

  return (
    <div className="aspect-video w-full rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 flex flex-col items-center justify-center gap-6 p-6">
      <div className="size-10 rounded-full border-2 border-blue-600/20 border-t-blue-600 animate-spin" />
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          {status === "PENDING" ? "Waiting in the queue…" : "Building your deck…"}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">This usually takes under a minute. You can leave this page.</p>
      </div>
      <ol className="flex flex-wrap justify-center gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors ${
              i < active
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                : i === active
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                  : "bg-stone-100/70 dark:bg-stone-800/60 text-stone-400"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

function SlidePlayer({ deck }: { deck: DeckDetail }) {
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const total = deck.slides.length;
  const slide = deck.slides[Math.min(current, total - 1)];
  const deckTitle = deck.title ?? "Pitch deck";

  const go = useCallback((delta: number) => {
    setCurrent((c) => Math.max(0, Math.min(total - 1, c + delta)));
  }, [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const copyText = async () => {
    await navigator.clipboard.writeText(deckAsText(deck));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div ref={stageRef} className="relative group bg-[#fbfbfa] dark:bg-[#0f0f10] [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:p-8">
        <SlideCard slide={slide} index={current} total={total} deckTitle={deckTitle} />
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={current === 0}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-center text-stone-700 dark:text-stone-200 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:hidden transition-opacity cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={current === total - 1}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-center text-stone-700 dark:text-stone-200 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:hidden transition-opacity cursor-pointer"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-mono text-stone-500">
          Slide {current + 1} of {total} · use ← → keys
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100/80 dark:bg-stone-800/70 hover:bg-stone-200/80 dark:hover:bg-stone-700/70 transition-colors cursor-pointer"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy as text"}
          </button>
          <button
            type="button"
            onClick={() => stageRef.current?.requestFullscreen?.()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Maximize2 className="size-3.5" /> Present
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {deck.slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}: ${s.title}`}
            aria-current={i === current}
            className={`text-left rounded-xl border p-2 transition-all cursor-pointer ${
              i === current
                ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/60 dark:bg-blue-500/10"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-white/70 dark:bg-stone-900/50"
            }`}
          >
            <span className="block text-[10px] font-mono text-stone-400">{String(i + 1).padStart(2, "0")}</span>
            <span className="block text-[11px] font-medium text-stone-800 dark:text-stone-200 truncate">{s.title}</span>
          </button>
        ))}
      </div>

      {slide.imagePrompt && (
        <div className="flex gap-2.5 rounded-2xl bg-stone-100/60 dark:bg-stone-900/60 px-4 py-3">
          <ImageIcon className="size-3.5 mt-0.5 text-stone-400 shrink-0" />
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
            <span className="font-medium text-stone-600 dark:text-stone-300">Visual idea: </span>
            {slide.imagePrompt}
          </p>
        </div>
      )}
    </div>
  );
}
