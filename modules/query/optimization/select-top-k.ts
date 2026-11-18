import { queryConfig } from "../config";
import type { OptimizedQuery, SearchQuery } from "../types";

export function selectTopK(input: OptimizedQuery): SearchQuery[] {
  const candidates: SearchQuery[] = [
    { text: input.rewritten, kind: "rewrite" },
    ...input.subQueries.map((text) => ({ text, kind: "sub-query" as const })),
    ...(input.stepBack ? [{ text: input.stepBack, kind: "step-back" as const }] : []),
    ...(input.hyde ? [{ text: input.hyde, kind: "hyde" as const }] : []),
  ];
  const seen = new Set<string>();
  const result: SearchQuery[] = [];
  for (const item of candidates) {
    const text = item.text.trim().replace(/\s+/g, " ");
    const key = text.toLocaleLowerCase();
    if (text && !seen.has(key)) { seen.add(key); result.push({ ...item, text }); }
    if (result.length >= queryConfig.TOP_K_QUERIES) break;
  }
  if (!result.length) return [{ text: input.original, kind: "rewrite" }];
  return result;
}
