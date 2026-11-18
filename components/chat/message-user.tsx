"use client";

import React from "react";

interface MessageUserProps {
  content: string;
}

export function MessageUser({ content }: MessageUserProps) {
  return (
    <div className="flex justify-end w-full py-1">
      <div className="max-w-[85%] sm:max-w-[70%] px-5 py-3 rounded-2xl sm:rounded-3xl bg-stone-100 dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words shadow-2xs border border-stone-200/50 dark:border-stone-700/50">
        {content}
      </div>
    </div>
  );
}
