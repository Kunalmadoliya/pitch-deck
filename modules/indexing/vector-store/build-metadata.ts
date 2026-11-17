import type { Chunk } from "../types";

export function buildMetadata(
  chunk: Chunk,
  document: { id: string; userId: string; fileName: string },
): Record<string, string | number> {
  return {
    documentId: document.id,
    userId: document.userId,
    fileName: document.fileName,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
    source: chunk.source,
    ocrConfidence: chunk.ocrConfidence ?? 0,
    text: chunk.text,
  };
}
