import { IndexingStage } from "@/lib/generated/prisma/client";
import { chunkPage } from "../chunking/chunk-page";
import { PAGE_CONCURRENCY } from "../config";
import { extractPage } from "../extraction/extract-page";
import { openPdf } from "../extraction/open-pdf";
import { logIndexingTiming } from "../logger";
import type { createDocumentRepo } from "../repository/document-repo";
import { readFileCached } from "../storage/read-file-cached";
import type { Storage } from "../storage/storage.interface";
import type { BatchSummary, FileKind } from "../types";
import { buildMetadata } from "../vector-store/build-metadata";
import { createPineconeIndex } from "../vector-store/pinecone-client";
import { upsertChunks } from "../vector-store/upsert-chunks";
import { mapWithConcurrency } from "./map-with-concurrency";

/**
 * Assembly line for a group of pages:
 *
 *   download once (cached) -> open PDF once
 *     page 1: read/OCR -> chunk -> send to Pinecone -> save progress
 *     page 2: read/OCR -> chunk -> send to Pinecone -> save progress   (at the same time)
 *     ...
 *
 * Pinecone turns `chunk_text` into vectors itself (integrated embedding), so there is
 * no separate embedding step here. A page is searchable as soon as it is sent.
 */
export async function processPageBatch(
  storage: Storage,
  repo: ReturnType<typeof createDocumentRepo>,
  input: { documentId: string; userId: string; fileName: string; storageFileId: string; kind: FileKind; pageNumbers: number[] },
): Promise<BatchSummary> {
  const batchStartedAt = Date.now();
  const data = await readFileCached(storage, input.storageFileId);
  const downloadMs = Date.now() - batchStartedAt;

  await repo.setStage(input.documentId, IndexingStage.EXTRACTING);
  const openStartedAt = Date.now();
  const pdf = input.kind === "pdf" ? await openPdf(data) : null;
  const openMs = Date.now() - openStartedAt;
  const index = createPineconeIndex();

  try {
    const pages = await mapWithConcurrency(input.pageNumbers, PAGE_CONCURRENCY, async (pageNumber) => {
      const pageStartedAt = Date.now();
      const { page, ocrMs } = await extractPage({ kind: input.kind, data, pdf }, pageNumber);
      const extractMs = Date.now() - pageStartedAt;

      const chunks = await chunkPage(page);

      const upsertStartedAt = Date.now();
      await upsertChunks(
        index,
        input.userId,
        chunks.map((chunk) => ({
          id: `${input.documentId}:${chunk.pageNumber}:${chunk.chunkIndex}`,
          text: chunk.text,
          title: input.fileName,
          metadata: buildMetadata(chunk, { id: input.documentId, userId: input.userId, fileName: input.fileName }),
        })),
      );
      const upsertMs = Date.now() - upsertStartedAt;

      await repo.recordPage(input.documentId, {
        pageNumber,
        source: page.source === "ocr" ? "OCR" : "TEXT_LAYER",
        ocrConfidence: page.ocrConfidence,
        charCount: page.text.length,
        chunkCount: chunks.length,
      });

      logIndexingTiming("page", {
        documentId: input.documentId,
        pageNumber,
        source: page.source,
        chunks: chunks.length,
        extractMs,
        ocrMs,
        upsertMs,
        totalMs: Date.now() - pageStartedAt,
      });
      return { chunks: chunks.length, ocr: page.source === "ocr" };
    });

    const totalMs = Date.now() - batchStartedAt;
    const chunkTotal = pages.reduce((sum, page) => sum + page.chunks, 0);
    logIndexingTiming("batch", {
      documentId: input.documentId,
      firstPage: input.pageNumbers[0],
      lastPage: input.pageNumbers[input.pageNumbers.length - 1],
      pages: pages.length,
      ocrPages: pages.filter((page) => page.ocr).length,
      chunks: chunkTotal,
      downloadMs,
      openMs,
      totalMs,
      msPerPage: pages.length ? Math.round(totalMs / pages.length) : 0,
    });
    return { pages: pages.length, chunks: chunkTotal };
  } finally {
    await pdf?.close();
  }
}
