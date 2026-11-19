import { DocumentStatus, IndexingStage, type PrismaClient } from "@/lib/generated/prisma/client";

export function createDocumentRepo(database: PrismaClient) {
  return {
    getById(id: string) {
      return database.document.findUnique({ where: { id } });
    },
    getByStorageFileId(storageFileId: string) {
      return database.document.findUnique({ where: { storageFileId } });
    },
    listByUser(userId: string) {
      return database.document.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          status: true,
          stage: true,
          pageCount: true,
          pagesProcessed: true,
          chunkCount: true,
          errorMessage: true,
          indexedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    },
    setInspecting(id: string, pageCount: number) {
      return database.document.update({
        where: { id },
        data: { status: DocumentStatus.PROCESSING, stage: IndexingStage.INSPECTING, pageCount },
      });
    },
    setStage(id: string, stage: IndexingStage) {
      return database.document.update({
        where: { id },
        data: { status: DocumentStatus.PROCESSING, stage },
      });
    },
    /**
     * Save one finished page and bump the document's progress counters.
     * Safe to run again on a retry: a page that was already saved is not counted twice.
     */
    recordPage(
      documentId: string,
      page: { pageNumber: number; source: "TEXT_LAYER" | "OCR"; ocrConfidence?: number; charCount: number; chunkCount: number },
    ) {
      return database.$transaction(async (tx) => {
        const where = { documentId_pageNumber: { documentId, pageNumber: page.pageNumber } };
        const previous = await tx.documentPage.findUnique({ where, select: { chunkCount: true } });
        await tx.documentPage.upsert({ where, create: { documentId, ...page }, update: page });
        await tx.document.update({
          where: { id: documentId },
          data: {
            pagesProcessed: { increment: previous ? 0 : 1 },
            chunkCount: { increment: page.chunkCount - (previous?.chunkCount ?? 0) },
          },
        });
      });
    },
    finalize(id: string) {
      return database.document.update({
        where: { id },
        data: { status: DocumentStatus.INDEXED, stage: IndexingStage.DONE, indexedAt: new Date() },
      });
    },
    fail(id: string, errorMessage: string) {
      return database.document.update({
        where: { id },
        data: { status: DocumentStatus.FAILED, errorMessage: errorMessage.slice(0, 500) },
      });
    },
    deleteOwned(id: string, userId: string) {
      return database.document.deleteMany({ where: { id, userId } });
    },
  };
}
