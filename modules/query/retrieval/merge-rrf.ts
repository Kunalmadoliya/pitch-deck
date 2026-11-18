import { queryConfig } from "../config";
import type { Chunk } from "../types";

export function mergeRrf(lists: Chunk[][]): Chunk[] {
  const scores = new Map<string, number>();
  const items = new Map<string, Chunk>();
  lists.forEach((list) => list.forEach((item, index) => {
    scores.set(item.id, (scores.get(item.id) ?? 0) + 1 / (queryConfig.RRF_K + index + 1));
    items.set(item.id, item);
  }));
  return [...items.values()].sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0))
    .slice(0, queryConfig.RERANK_CANDIDATES).map((item) => ({ ...item, score: scores.get(item.id) }));
}
