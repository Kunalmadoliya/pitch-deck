import React from "react";
import type { DeckSlide } from "@/lib/api/decks";

/** Splits "• a\n• b" (or one long line with bullets) into clean bullet strings. */
export function slideBullets(content: string): string[] {
  return content
    .split(/\n|(?=•)/)
    .map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

interface SlideCardProps {
  slide: DeckSlide;
  index: number;
  total: number;
  deckTitle: string;
}

/** One slide drawn on a 16:9 canvas. The first slide uses a bold title layout. */
export function SlideCard({ slide, index, total, deckTitle }: SlideCardProps) {
  const bullets = slideBullets(slide.content);
  const isCover = index === 0;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
      {isCover ? (
        <div className="absolute inset-0 flex flex-col justify-center p-[7%] bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <span className="text-[clamp(9px,1.3vw,13px)] font-mono uppercase tracking-[0.2em] text-blue-100/80">
            Investor deck
          </span>
          <h2 className="mt-3 text-[clamp(20px,4.4vw,48px)] font-bold tracking-tight leading-[1.05]">
            {slide.title}
          </h2>
          {bullets.length > 0 && (
            <p className="mt-4 text-[clamp(11px,1.8vw,20px)] text-blue-50/90 max-w-[80%] leading-snug">
              {bullets.join(" ")}
            </p>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col p-[6%]">
          <span className="text-[clamp(8px,1.1vw,12px)] font-mono uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2 className="mt-2 text-[clamp(16px,3vw,34px)] font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
            {slide.title}
          </h2>
          <div className="mt-[3%] h-px w-16 bg-blue-600/70" />
          <ul className="mt-[4%] space-y-[2.2%] flex-1">
            {bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex gap-3 text-[clamp(11px,1.75vw,20px)] text-stone-700 dark:text-stone-300 leading-snug"
              >
                <span className="mt-[0.45em] size-[0.4em] rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div
        className={`absolute bottom-[4%] left-[6%] right-[6%] flex justify-between text-[clamp(7px,1vw,11px)] font-mono ${
          isCover ? "text-blue-100/70" : "text-stone-400"
        }`}
      >
        <span className="truncate pr-4">{deckTitle}</span>
        <span>
          {index + 1} / {total}
        </span>
      </div>
    </div>
  );
}
