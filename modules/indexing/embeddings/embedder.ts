import { OpenAIEmbeddings } from "@langchain/openai";
import { EmbeddingError } from "../errors";
import { indexingConfig, EMBEDDING_MODEL } from "../config";

export interface Embedder {
  embedDocuments(texts: string[]): Promise<number[][]>;
}

export function createEmbedder(): Embedder {
  if (!indexingConfig.OPENAI_API_KEY) {
    throw new EmbeddingError("OPENAI_API_KEY is not configured");
  }
  return new OpenAIEmbeddings({
    apiKey: indexingConfig.OPENAI_API_KEY,
    model: EMBEDDING_MODEL,
  });
}
