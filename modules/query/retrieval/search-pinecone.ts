import { createPineconeIndex } from "@/modules/indexing/vector-store/pinecone-client";
import type { Chunk } from "../types";

interface Match {
  _id?: string;
  _score?: number | null;
  documentId?: string;
  fileName?: string;
  pageNumber?: number;
  chunkIndex?: number;
  text?: string;
  chunk_text?: string;
  [key: string]: unknown;
}
export async function searchPinecone(userId: string, queryText: string, topK: number, documentIds?: string[]): Promise<Chunk[]> {
  const response = await createPineconeIndex().namespace(userId).documents.search({
    scoreBy: [{ type: "embed", field: "chunk_text", query: queryText }],
    topK,
    includeFields: ["*"],
  });
  const matches = response.matches as Match[];
  const usable = matches.flatMap((match) => {
    const id = match._id ?? "";
    const idParts = id.split(":");
    const chunkIndex = Number(idParts.pop());
    const pageNumber = Number(idParts.pop());
    const documentId = idParts.join(":");
    if (!documentId || !Number.isInteger(pageNumber) || !Number.isInteger(chunkIndex)) return [];
    if (documentIds?.length && !documentIds.includes(documentId)) return [];
    const text = typeof match.text === "string" ? match.text : typeof match.chunk_text === "string" ? match.chunk_text : "";
    if (!text) return [];
    return [{
      id,
      text,
      documentId,
      fileName: typeof match.title === "string" ? match.title : "Unknown document",
      pageNumber,
      chunkIndex,
      score: match._score ?? undefined,
    }];
  });
  console.info("[chat-retrieval]", { matchCount: matches.length, usableChunkCount: usable.length });
  return usable;
}
