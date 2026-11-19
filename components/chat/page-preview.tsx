"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, ImageOff } from "lucide-react";
import type { Citation } from "@/lib/api/chat-types";

const CARD_WIDTH = 264;
// A4 page (1 : 1.414) plus the caption row.
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.414) + 46;
const GAP = 10;
const EDGE = 8;
const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 80;

export function pagePreviewUrl(citation: Pick<Citation, "documentId" | "pageNumber">): string {
  return `/api/documents/${encodeURIComponent(citation.documentId)}/pages/${citation.pageNumber}/preview`;
}

interface Placement {
  top: number;
  left: number;
  side: "above" | "below";
  originX: number;
}

function place(anchor: DOMRect): Placement {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const roomAbove = anchor.top - GAP - EDGE;
  const roomBelow = viewportHeight - anchor.bottom - GAP - EDGE;
  const side = roomAbove >= CARD_HEIGHT || roomAbove > roomBelow ? "above" : "below";
  const top = side === "above"
    ? Math.max(EDGE, anchor.top - GAP - CARD_HEIGHT)
    : Math.min(viewportHeight - CARD_HEIGHT - EDGE, anchor.bottom + GAP);
  const centered = anchor.left + anchor.width / 2 - CARD_WIDTH / 2;
  const left = Math.min(Math.max(EDGE, centered), viewportWidth - CARD_WIDTH - EDGE);
  // Where the pill sits along the card's edge, so the card grows out of it.
  const originX = Math.min(Math.max(anchor.left + anchor.width / 2 - left, 16), CARD_WIDTH - 16);
  return { top, left, side, originX };
}

/**
 * Hover (or keyboard-focus) anything wrapped in this and a picture of the cited page pops up.
 * The image is only requested once the preview opens, and the browser caches it afterwards.
 */
export function PagePreviewTrigger({
  citation,
  children,
  className,
  as: Wrapper = "span",
}: {
  citation: Citation;
  children: React.ReactNode;
  className?: string;
  /** "span" inside text (citation pills), "div" around block content (source cards). */
  as?: "span" | "div";
}) {
  const anchorRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const open = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (anchorRef.current) setPlacement(place(anchorRef.current.getBoundingClientRect()));
    }, OPEN_DELAY_MS);
  }, []);

  const close = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setPlacement(null), CLOSE_DELAY_MS);
  }, []);

  // The chat thread scrolls under a fixed card, so close instead of drifting away from the pill.
  useEffect(() => {
    if (!placement) return;
    const hide = () => setPlacement(null);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && hide();
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("keydown", onKey);
    };
  }, [placement]);

  useEffect(() => clearTimer, []);

  return (
    <Wrapper
      ref={anchorRef as React.Ref<never>}
      className={className}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {placement && typeof document !== "undefined" &&
        createPortal(<PagePreviewCard citation={citation} placement={placement} />, document.body)}
    </Wrapper>
  );
}

function PagePreviewCard({ citation, placement }: { citation: Citation; placement: Placement }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  return (
    <div
      role="tooltip"
      className="animate-page-preview fixed z-[60] pointer-events-none rounded-2xl bg-white dark:bg-stone-900 p-1.5 shadow-[0_18px_50px_-12px_rgba(28,25,23,0.35)] ring-1 ring-stone-200 dark:ring-stone-800"
      style={{
        top: placement.top,
        left: placement.left,
        width: CARD_WIDTH,
        transformOrigin: `${placement.originX}px ${placement.side === "above" ? "100%" : "0%"}`,
        ["--preview-shift" as string]: placement.side === "above" ? "6px" : "-6px",
      }}
    >
      <div className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl bg-stone-50 dark:bg-stone-950 ring-1 ring-inset ring-stone-200/70 dark:ring-stone-800">
        {status === "loading" && (
          <div className="absolute inset-0 p-5 space-y-2.5 animate-pulse" aria-hidden>
            <div className="h-2.5 w-2/3 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="h-2 w-full rounded-full bg-stone-200/80 dark:bg-stone-800/80" />
            <div className="h-2 w-11/12 rounded-full bg-stone-200/80 dark:bg-stone-800/80" />
            <div className="h-2 w-4/5 rounded-full bg-stone-200/80 dark:bg-stone-800/80" />
            <div className="h-2 w-full rounded-full bg-stone-200/80 dark:bg-stone-800/80 mt-5" />
            <div className="h-2 w-3/4 rounded-full bg-stone-200/80 dark:bg-stone-800/80" />
          </div>
        )}
        {status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs px-6 text-center">
            <ImageOff className="size-5" />
            <span>This page can&apos;t be shown right now</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- private, per-user image from our own API
          <img
            src={pagePreviewUrl(citation)}
            alt={`Page ${citation.pageNumber} of ${citation.fileName}`}
            onLoad={() => setStatus("ready")}
            onError={() => setStatus("error")}
            className={`absolute inset-0 size-full object-contain bg-white transition-opacity duration-200 ${
              status === "ready" ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      <div className="flex items-center gap-2 px-1.5 pt-2 pb-1 text-xs">
        <FileText className="size-3.5 shrink-0 text-stone-400" />
        <span className="flex-1 truncate font-medium text-stone-800 dark:text-stone-200">{citation.fileName}</span>
        <span className="shrink-0 rounded-md bg-blue-50 dark:bg-blue-950/70 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
          Page {citation.pageNumber}
        </span>
      </div>
    </div>
  );
}
