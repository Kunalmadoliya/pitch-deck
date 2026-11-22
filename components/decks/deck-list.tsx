"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Presentation, Trash2 } from "lucide-react";
import { useDecks, useDeleteDeck } from "@/hooks/use-decks";
import { DeckStatusPill } from "./deck-status-pill";

export function DeckList() {
  const { data: decks, isLoading, error } = useDecks();
  const deleteDeck = useDeleteDeck();

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-red-600 dark:text-red-400">{error.message}</p>;
  }

  if (!decks || decks.length === 0) {
    return (
      <div className="py-10 text-center space-y-1.5">
        <Presentation className="size-6 mx-auto text-stone-300 dark:text-stone-700" />
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">No decks yet</p>
        <p className="text-xs text-stone-500 dark:text-stone-400">Describe an idea above to generate your first deck.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-mono uppercase tracking-wider text-stone-400">Your decks</h2>
      <ul className="divide-y divide-dotted divide-stone-300 dark:divide-stone-800 border-y border-dotted border-stone-300 dark:border-stone-800">
        {decks.map((deck) => (
          <li key={deck.id} className="group flex items-center gap-3 py-3.5">
            <Link href={`/dashboard/decks/${deck.id}`} className="flex-1 min-w-0 flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Presentation className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {deck.title ?? deck.idea}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {deck.status === "FAILED" && deck.errorMessage
                    ? deck.errorMessage
                    : `Created ${formatDistanceToNow(new Date(deck.createdAt), { addSuffix: true })}`}
                </div>
              </div>
            </Link>
            <DeckStatusPill status={deck.status} />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this deck? This cannot be undone.")) deleteDeck.mutate(deck.id);
              }}
              className="p-2 rounded-full text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
              aria-label={`Delete ${deck.title ?? "deck"}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
