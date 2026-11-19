"use client";

import React, { memo, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Citation } from "@/lib/api/chat-types";
import { CitationPill } from "./citation-pill";

const CITE_PREFIX = "#cite-";

/**
 * Turn "[2]" into a markdown link "[2](#cite-2)" so the markdown renderer hands it to our
 * `a` component, which draws a citation pill. Numbers with no matching source stay as plain text.
 * `(?!\()` skips things that are already real links, like "[2](https://...)".
 */
function linkCitations(text: string, known: Set<number>): string {
  return text.replace(/\[(\d+)\](?!\()/g, (marker, raw: string) =>
    known.has(Number(raw)) ? `[${raw}](${CITE_PREFIX}${raw})` : marker,
  );
}

function buildComponents(citations: Map<number, Citation>): Components {
  return {
    a({ href, children }) {
      if (href?.startsWith(CITE_PREFIX)) {
        const citation = citations.get(Number(href.slice(CITE_PREFIX.length)));
        if (citation) return <CitationPill citation={citation} />;
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80"
        >
          {children}
        </a>
      );
    },
    p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-stone-950 dark:text-white">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    h1: ({ children }) => <h3 className="mt-5 mb-2 first:mt-0 text-base sm:text-lg font-semibold">{children}</h3>,
    h2: ({ children }) => <h3 className="mt-5 mb-2 first:mt-0 text-base sm:text-lg font-semibold">{children}</h3>,
    h3: ({ children }) => <h4 className="mt-4 mb-1.5 first:mt-0 font-semibold">{children}</h4>,
    h4: ({ children }) => <h5 className="mt-3 mb-1 first:mt-0 font-semibold">{children}</h5>,
    ul: ({ children }) => <ul className="my-3 pl-5 list-disc space-y-1.5 marker:text-stone-400">{children}</ul>,
    ol: ({ children }) => <ol className="my-3 pl-5 list-decimal space-y-2 marker:text-stone-400 marker:font-medium">{children}</ol>,
    li: ({ children }) => <li className="pl-1 [&>ul]:mt-1.5 [&>ol]:mt-1.5 [&>p]:my-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-2 border-stone-300 dark:border-stone-700 pl-3 text-stone-600 dark:text-stone-400">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-5 border-stone-200 dark:border-stone-800" />,
    code({ className, children }) {
      // Fenced blocks carry a "language-xxx" class; inline code does not.
      if (className) return <code className={`${className} font-mono text-[13px]`}>{children}</code>;
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-mono text-[0.85em]">{children}</code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-3 p-3 rounded-xl bg-stone-100 dark:bg-stone-900 overflow-x-auto text-[13px] leading-relaxed">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-stone-50 dark:bg-stone-900/60">{children}</thead>,
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-semibold border-b border-stone-200 dark:border-stone-800">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 align-top border-b border-stone-100 dark:border-stone-800/60">{children}</td>
    ),
  };
}

interface MarkdownAnswerProps {
  content: string;
  citations?: Citation[];
}

/** Renders the assistant's answer as Markdown (lists, bold, tables...) with clickable [n] source pills. */
export const MarkdownAnswer = memo(function MarkdownAnswer({ content, citations = [] }: MarkdownAnswerProps) {
  const citationMap = useMemo(() => new Map(citations.map((citation) => [citation.n, citation])), [citations]);
  const components = useMemo(() => buildComponents(citationMap), [citationMap]);
  const markdown = useMemo(() => linkCitations(content, new Set(citationMap.keys())), [content, citationMap]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
});
