"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";
import { MAX_QUERY_CHARS } from "@/lib/api/chat-types";
import { ScopePicker } from "./scope-picker";

interface ComposerProps {
  onSend: (message: string, documentIds?: string[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function Composer({ onSend, onStop, isStreaming, disabled }: ComposerProps) {
  const [input, setInput] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed, selectedDocIds.length > 0 ? selectedDocIds : undefined);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = input.length;
  const isNearLimit = charCount > 3000;

  return (
    <div className="w-full space-y-1.5 max-w-3xl mx-auto">
      <div className="relative rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm focus-within:border-blue-500/80 dark:focus-within:border-blue-400/80 focus-within:ring-2 focus-within:ring-blue-500/15 p-2 sm:p-2.5 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_QUERY_CHARS))}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Ask anything about your company policies..."
          className="w-full bg-transparent resize-none border-0 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none px-3 pt-1.5 pb-2 leading-relaxed max-h-36 font-sans"
        />

        <div className="flex items-center justify-between gap-2 px-2 pt-1 border-t border-dashed border-stone-100 dark:border-stone-800/80">
          <ScopePicker
            selectedIds={selectedDocIds}
            onChange={setSelectedDocIds}
            disabled={isStreaming || disabled}
          />

          <div className="flex items-center gap-2">
            {isNearLimit && (
              <span className="font-mono text-[10px] text-stone-400">
                {charCount}/{MAX_QUERY_CHARS}
              </span>
            )}

            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="size-8 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                title="Stop generation"
              >
                <Square className="size-3 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim() || disabled}
                className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600 transition-all cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                title="Send query"
              >
                <ArrowUp className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-stone-400 dark:text-stone-500 hidden sm:block">
        Return to send · Shift + Return for new line
      </div>
    </div>
  );
}
