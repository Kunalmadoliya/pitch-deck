import type { Chunk, VectorRecord } from "../types";
import type { Embedder } from "./embedder";
import { EMBEDDING_BATCH_SIZE } from "../config";

export async function embedChunks(
  chunks: Chunk[],
  embedder: Embedder,
  buildRecord: (chunk: Chunk, values: number[]) => VectorRecord,
  batchSize = EMBEDDING_BATCH_SIZE,
): Promise<VectorRecord[]> {
  const records: VectorRecord[] = [];
  for (let start = 0; start < chunks.length; start += batchSize) {
    const batch = chunks.slice(start, start + batchSize);
    const values = await embedder.embedDocuments(batch.map((chunk) => chunk.text));
    records.push(...batch.map((chunk, index) => buildRecord(chunk, values[index])));
  }
  return records;
}
