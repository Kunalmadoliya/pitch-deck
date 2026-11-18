import { Pinecone } from "@pinecone-database/pinecone";
import { indexingConfig } from "@/modules/indexing/config";
import { queryConfig } from "../config";
import type { Chunk } from "../types";
import type { Reranker } from "./reranker.interface";
export class PineconeReranker implements Reranker {
  async rerank(query: string, chunks: Chunk[], topN: number): Promise<Chunk[]> {
    if (!indexingConfig.PINECONE_API_KEY) throw new Error("PINECONE_API_KEY is not configured");
    const client = new Pinecone({ apiKey: indexingConfig.PINECONE_API_KEY });
    const result = await client.inference.rerank({
      model: queryConfig.RERANK_MODEL, query, documents: chunks.map((chunk) => ({ text: chunk.text })),
      rankFields: ["text"], topN, returnDocuments: false,
    });
    return result.data.map((item) => ({ ...chunks[item.index], score: item.score }));
  }
}
