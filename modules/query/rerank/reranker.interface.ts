import type { Chunk } from "../types";
export interface Reranker { rerank(query: string, chunks: Chunk[], topN: number): Promise<Chunk[]> }
