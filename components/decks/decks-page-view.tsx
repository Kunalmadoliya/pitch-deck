"use client";

import React from "react";
import Link from "next/link";
import { useDecks } from "@/hooks/use-decks";
import { NewDeckForm } from "./new-deck-form";
import { DeckList } from "./deck-list";

export function DecksPageView() {
  const { data: decks } = useDecks();
  const total = decks?.length ?? 0;
  const ready = decks?.filter((d) => d.status === "COMPLETE").length ?? 0;
  const busy = decks?.filter((d) => d.status === "PENDING" || d.status === "GENERATING").length ?? 0;

  return (
    <div className="space-y-10 sm:space-y-12">
      <section aria-label="Pitch Deck Header" className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
          <Link
            href="/dashboard"
            className="hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-full bg-stone-100/70 dark:bg-stone-800/70 transition-colors"
          >
            ← Overview
          </Link>
          <span className="text-stone-300 dark:text-stone-700 select-none">•</span>
          <span className="text-stone-400">Investor storyboards</span>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            AI Pitch Deck
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
            Turn a short project idea into a 7-slide investor deck: problem, solution, market, product, business model and the ask.
          </p>
        </div>
        {total > 0 && (
          <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-medium">
            {total} deck{total === 1 ? "" : "s"} · {ready} ready{busy > 0 ? ` · ${busy} generating` : ""}
          </div>
        )}
      </section>

      <section aria-label="New deck">
        <NewDeckForm />
      </section>

      <section aria-label="Decks">
        <DeckList />
      </section>
    </div>
  );
}
