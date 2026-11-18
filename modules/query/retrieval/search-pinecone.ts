import { createPineconeIndex } from "@/modules/indexing/vector-store/pinecone-client";
import type { Chunk } from "../types";

interface Match { id?: string; _id?: string; score?: number; metadata?: Record<string, string | number> }
export async function searchPinecone(userId: string, vector: number[], topK: number, documentIds?: string[]): Promise<Chunk[]> {
  const filter = documentIds?.length ? { documentId: { $in: documentIds } } : undefined;
  const response = await createPineconeIndex().namespace(userId).query({ vector, topK, includeMetadata: true, filter });
  return (response.matches as Match[]).flatMap((match) => {
    const metadata = match.metadata;
    if (!metadata || typeof metadata.documentId !== "string" || typeof metadata.fileName !== "string" || typeof metadata.pageNumber !== "number" || typeof metadata.chunkIndex !== "number" || typeof metadata.text !== "string") return [];
    return [{ id: match.id ?? match._id ?? "", text: metadata.text, documentId: metadata.documentId, fileName: metadata.fileName, pageNumber: metadata.pageNumber, chunkIndex: metadata.chunkIndex, score: match.score }];
  });
}
