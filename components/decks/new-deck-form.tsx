"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useCreateDeck } from "@/hooks/use-decks";
import { MAX_IDEA_CHARS, MIN_IDEA_CHARS } from "@/lib/api/decks";

const EXAMPLES = [
  "A mobile app that helps small restaurants cut food waste by predicting daily demand from weather and past sales.",
  "A marketplace connecting freelance electricians with homeowners for same-day repairs, with upfront fixed pricing.",
  "An AI tutor for high-school maths that explains each mistake step by step in the student's own language.",
];

export function NewDeckForm() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const createDeck = useCreateDeck();

  const trimmed = idea.trim();
  const tooShort = trimmed.length < MIN_IDEA_CHARS;
  const remaining = MIN_IDEA_CHARS - trimmed.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tooShort || createDeck.isPending) return;
    createDeck.mutate(trimmed, {
      onSuccess: ({ deckId }) => router.push(`/dashboard/decks/${deckId}`),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-dotted border-stone-300 dark:border-stone-800 bg-white/80 dark:bg-stone-900/50 p-5 sm:p-6 space-y-4 shadow-xs"
    >
      <div className="space-y-1">
        <label htmlFor="deck-idea" className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Describe your project idea
        </label>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Who it is for, what problem it solves, and how it makes money. More detail gives a better deck.
        </p>
      </div>

      <textarea
        id="deck-idea"
        value={idea}
        onChange={(e) => setIdea(e.target.value.slice(0, MAX_IDEA_CHARS))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
        }}
        rows={4}
        disabled={createDeck.isPending}
        placeholder="e.g. A subscription app that..."
        className="w-full resize-y rounded-2xl border border-stone-200 dark:border-stone-800 bg-transparent px-4 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/15 leading-relaxed"
      />

      {!trimmed && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setIdea(example)}
              className="text-left text-[11px] text-stone-600 dark:text-stone-300 px-3 py-1.5 rounded-full bg-stone-100/80 dark:bg-stone-800/70 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-300 transition-colors cursor-pointer max-w-full truncate"
              title={example}
            >
              {example.split(" ").slice(0, 7).join(" ")}…
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[11px] font-mono text-stone-400">
          {createDeck.error ? (
            <span className="text-red-600 dark:text-red-400">{createDeck.error.message}</span>
          ) : tooShort && trimmed.length > 0 ? (
            `${remaining} more character${remaining === 1 ? "" : "s"} needed`
          ) : (
            `${idea.length}/${MAX_IDEA_CHARS} · Ctrl + Enter to generate`
          )}
        </span>
        <button
          type="submit"
          disabled={tooShort || createDeck.isPending}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Sparkles className="size-3.5" />
          {createDeck.isPending ? "Starting…" : "Generate deck"}
        </button>
      </div>
    </form>
  );
}
