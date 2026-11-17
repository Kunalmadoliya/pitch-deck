import { IndexingStage } from "@/lib/generated/prisma/client";
import { chunkPage } from "../chunking/chunk-page";
import { embedChunks } from "../embeddings/embed-chunks";
import { createEmbedder } from "../embeddings/embedder";
import { extractPages } from "../extraction/extract-pages";
import type { Storage } from "../storage/storage.interface";
import type { FileKind } from "../types";
import { buildMetadata } from "../vector-store/build-metadata";
import { createPineconeIndex } from "../vector-store/pinecone-client";
import { upsertChunks } from "../vector-store/upsert-chunks";

export async function processPageBatch(
  storage: Storage,
  repo: ReturnType<typeof import("../repository/document-repo").createDocumentRepo>,
  input: { documentId: string; userId: string; fileName: string; storagePath: string; kind: FileKind; pageNumbers: number[] },
): Promise<{ pages: number; chunks: number }> {
  const data = await storage.read(input.storagePath);
  await repo.setStage(input.documentId, IndexingStage.EXTRACTING);
  const pages = await extractPages(data, input.kind, input.pageNumbers);
  await repo.setStage(input.documentId, IndexingStage.CHUNKING);
  const chunks = (await Promise.all(pages.map((page) => chunkPage(page)))).flat();
  await repo.setStage(input.documentId, IndexingStage.EMBEDDING);
  const embedder = createEmbedder();
  const records = await embedChunks(chunks, embedder, (chunk, values) => ({
    id: `${input.documentId}:${chunk.pageNumber}:${chunk.chunkIndex}`,
    values,
    metadata: buildMetadata(chunk, {
      id: input.documentId,
      userId: input.userId,
      fileName: input.fileName,
    }),
  }));
  await repo.setStage(input.documentId, IndexingStage.UPSERTING);
  await upsertChunks(createPineconeIndex(), input.userId, records);
  await Promise.all(
    pages.map((page) =>
      repo.upsertPage(input.documentId, {
        pageNumber: page.pageNumber,
        source: page.source === "ocr" ? "OCR" : "TEXT_LAYER",
        ocrConfidence: page.ocrConfidence,
        charCount: page.text.length,
        chunkCount: chunks.filter((chunk) => chunk.pageNumber === page.pageNumber).length,
      }),
    ),
  );
  await repo.incrementProgress(input.documentId, pages.length, chunks.length);
  return { pages: pages.length, chunks: chunks.length };
}
