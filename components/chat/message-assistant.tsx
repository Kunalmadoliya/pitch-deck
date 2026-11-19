"use client";

import React, { useState } from "react";
import { Copy, Check, RotateCw, AlertCircle } from "lucide-react";
import type { Citation, QueryStage } from "@/lib/api/chat-types";
import { errorMessage } from "@/lib/api/chat-types";
import { stripCitations } from "@/lib/citation-parser";
import { MarkdownAnswer } from "./markdown-answer";
import { SourcesList } from "./sources-list";
import { StageStatus } from "./stage-status";

interface MessageAssistantProps {
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
  currentStage?: QueryStage | null;
  errorCode?: string | null;
  onRetry?: () => void;
  isLatest?: boolean;
  onRegenerate?: () => void;
}

export function MessageAssistant({
  content,
  citations = [],
  isStreaming = false,
  currentStage = null,
  errorCode = null,
  onRetry,
  isLatest = false,
  onRegenerate,
}: MessageAssistantProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const clean = stripCitations(content);
      await navigator.clipboard.writeText(clean);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignore clipboard errors
    }
  };

  return (
    <div className="w-full space-y-3 group/msg">
      {/* Open text directly on page background */}
      <div className="text-sm sm:text-base leading-relaxed text-stone-900 dark:text-stone-100 break-words">
        <MarkdownAnswer content={content} citations={citations} />
      </div>

      {/* Streaming stage indicator */}
      {isStreaming && currentStage && <StageStatus stage={currentStage} />}

      {/* Error state */}
      {errorCode && (
        <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span className="flex-1">{errorMessage(errorCode)}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Sources list */}
      <SourcesList citations={citations} />

      {/* Message action bar */}
      {!isStreaming && content.length > 0 && (
        <div className="flex items-center gap-2 pt-1 text-stone-400 dark:text-stone-500 opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Copy response (clean text)"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-600" />
                <span className="text-[11px] text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>

          {isLatest && onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Regenerate answer"
            >
              <RotateCw className="size-3" />
              <span className="text-[11px]">Regenerate</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
