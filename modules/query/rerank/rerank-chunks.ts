import { queryConfig } from "../config";
import type { Chunk } from "../types";
import type { Reranker } from "./reranker.interface";
export async function rerankChunks(query: string, candidates: Chunk[], reranker: Reranker): Promise<Chunk[]> {
  if (!candidates.length) return [];
  try {
    const ranked = await reranker.rerank(query, candidates, queryConfig.RERANK_TOP_N);
    return ranked[0]?.score !== undefined && ranked[0].score < queryConfig.MIN_RERANK_SCORE ? [] : ranked;
  } catch {
    return candidates.slice(0, queryConfig.RERANK_TOP_N);
  }
}
