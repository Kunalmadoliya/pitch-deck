import React, { type CSSProperties } from "react";
import { ImageIcon } from "lucide-react";
import type { DeckSlide } from "@/lib/api/decks";

/** Splits "• a\n• b" (or one long line with bullets) into clean bullet strings. */
export function slideBullets(content: string): string[] {
  return content
    .split(/\n|(?=•)/)
    .map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * True when the picture has printed labels (diagrams, flowcharts, charts...).
 * Those must never be cropped, so they are shown whole ("contain") instead of filling the box ("cover").
 * The image prompt builder writes "Text: draw ONLY" whenever labels were requested.
 */
export function imageHasLabels(slide: Pick<DeckSlide, "imagePrompt">): boolean {
  return /Text:\s*draw ONLY/i.test(slide.imagePrompt);
}

/**
 * Picks text sizes from how much text the slide has, so long slides shrink instead of overflowing.
 * Sizes are in cqw (percent of the SLIDE's width), so they scale with the slide in every view:
 * page, thumbnail-size screens and fullscreen.
 */
function textSizes(bullets: string[], title: string, withImage: boolean) {
  const chars = bullets.join(" ").length;
  const scale = withImage ? 0.88 : 1;
  const body = (chars > 380 ? 1.45 : chars > 260 ? 1.65 : chars > 160 ? 1.85 : 2.05) * scale;
  const heading = (title.length > 60 ? 2.6 : title.length > 36 ? 3 : 3.4) * scale;
  return { body: `${body}cqw`, heading: `${heading}cqw` };
}

interface SlideCardProps {
  slide: DeckSlide;
  index: number;
  total: number;
  deckTitle: string;
}

/** Image area. Labelled pictures sit whole inside a 3:2 frame; photos fill their panel. */
function SlideImage({ slide, fit }: { slide: DeckSlide; fit: "contain" | "cover" }) {
  if (slide.imageStatus === "PENDING" && !slide.imageUrl) {
    return (
      <div className="size-full flex flex-col items-center justify-center gap-[1cqw] rounded-[1.4cqw] bg-stone-100 dark:bg-stone-800/70 animate-pulse">
        <ImageIcon className="size-[5cqw] text-stone-300 dark:text-stone-600" />
        <span className="text-[1.1cqw] font-mono text-stone-400">Drawing image…</span>
      </div>
    );
  }
  if (!slide.imageUrl) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, already sized for slides
    <img
      src={slide.imageUrl}
      alt={`Visual for "${slide.title}"`}
      className={`block size-full rounded-[1.4cqw] ${
        fit === "contain" ? "object-contain bg-white dark:bg-stone-50" : "object-cover"
      }`}
    />
  );
}

/** Frame for the image column: a fixed 3:2 box for labelled pictures, the full column otherwise. */
function ImageColumn({ slide }: { slide: DeckSlide }) {
  const fit = imageHasLabels(slide) ? "contain" : "cover";
  return (
    <div className="min-w-0 min-h-0 flex items-center justify-center">
      <div className={fit === "contain" ? "w-full max-h-full aspect-[3/2]" : "size-full"}>
        <SlideImage slide={slide} fit={fit} />
      </div>
    </div>
  );
}

function Footer({ deckTitle, index, total, light }: { deckTitle: string; index: number; total: number; light: boolean }) {
  return (
    <div
      className={`absolute bottom-[3cqw] left-[5cqw] right-[5cqw] flex items-center justify-between gap-[2cqw] text-[1cqw] font-mono ${
        light ? "text-blue-100/70" : "text-stone-400"
      }`}
    >
      <span className="truncate">{deckTitle}</span>
      <span className="shrink-0">
        {index + 1} / {total}
      </span>
    </div>
  );
}

function CoverSlide({ slide, index, total, deckTitle }: SlideCardProps) {
  const bullets = slideBullets(slide.content);
  const labelled = imageHasLabels(slide);
  // A plain picture becomes the background; a labelled one goes beside the title so nothing is covered.
  const background = Boolean(slide.imageUrl) && !labelled;
  const beside = labelled && (Boolean(slide.imageUrl) || slide.imageStatus === "PENDING");

  return (
    <div className="absolute inset-0 overflow-hidden bg-linear-to-br from-blue-600 to-blue-800 text-white">
      {background && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
          <img src={slide.imageUrl!} alt="" className="absolute inset-0 size-full object-cover" />
          {/* Keeps the white title readable on any picture. */}
          <div className="absolute inset-0 bg-linear-to-r from-blue-950/90 via-blue-900/65 to-blue-900/10" />
        </>
      )}
      <div
        className={`relative h-full grid gap-[4cqw] p-[6cqw] pb-[8cqw] ${beside ? "grid-cols-[1.1fr_1fr]" : "grid-cols-1"}`}
      >
        <div className="min-w-0 min-h-0 flex flex-col justify-center overflow-hidden">
          <span className="text-[1.2cqw] font-mono uppercase tracking-[0.2em] text-blue-100/80">Investor deck</span>
          <h2
            className="mt-[1.5cqw] font-bold tracking-tight leading-[1.05] line-clamp-4 wrap-break-word"
            style={{ fontSize: slide.title.length > 50 ? "3.8cqw" : "4.6cqw", maxWidth: beside ? undefined : "75%" }}
          >
            {slide.title}
          </h2>
          {bullets.length > 0 && (
            <p
              className="mt-[2cqw] text-blue-50/90 leading-snug line-clamp-3"
              style={{ fontSize: "1.8cqw", maxWidth: beside ? undefined : "62%" }}
            >
              {bullets.join(" ")}
            </p>
          )}
        </div>
        {beside && <ImageColumn slide={slide} />}
      </div>
      {slide.imageStatus === "PENDING" && !beside && (
        <span className="absolute top-[3cqw] right-[4cqw] text-[1.1cqw] font-mono text-blue-100/70 animate-pulse">
          Drawing cover image…
        </span>
      )}
      <Footer deckTitle={deckTitle} index={index} total={total} light />
    </div>
  );
}

function ContentSlide({ slide, index, total, deckTitle }: SlideCardProps) {
  const bullets = slideBullets(slide.content);
  const hasImage = Boolean(slide.imageUrl) || slide.imageStatus === "PENDING";
  const size = textSizes(bullets, slide.title, hasImage);
  const style = { "--body": size.body } as CSSProperties;

  return (
    <div
      className={`absolute inset-0 grid gap-[4cqw] p-[5cqw] pb-[7.5cqw] ${
        hasImage ? "grid-cols-[1.15fr_1fr]" : "grid-cols-1"
      }`}
      style={style}
    >
      <div className="min-w-0 min-h-0 flex flex-col overflow-hidden">
        <span className="text-[1.1cqw] font-mono uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2
          className="mt-[0.8cqw] font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight line-clamp-3 wrap-break-word shrink-0"
          style={{ fontSize: size.heading }}
        >
          {slide.title}
        </h2>
        <div className="mt-[1.6cqw] h-px w-[6cqw] bg-blue-600/70 shrink-0" />
        <ul className="mt-[2.2cqw] flex flex-col gap-[1.3cqw] min-h-0 overflow-hidden">
          {bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex gap-[1.2cqw] text-stone-700 dark:text-stone-300 leading-snug wrap-break-word"
              style={{ fontSize: "var(--body)" }}
            >
              <span className="mt-[0.5em] size-[0.4em] rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
              <span className="min-w-0 line-clamp-4">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
      {hasImage && <ImageColumn slide={slide} />}
      <Footer deckTitle={deckTitle} index={index} total={total} light={false} />
    </div>
  );
}

/**
 * One slide on a 16:9 canvas. `@container` makes every cqw size inside relative to this slide,
 * so the layout scales as one piece and nothing spills out of the box.
 */
export function SlideCard(props: SlideCardProps) {
  return (
    <div className="@container relative aspect-video w-full overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
      {props.index === 0 ? <CoverSlide {...props} /> : <ContentSlide {...props} />}
    </div>
  );
}
