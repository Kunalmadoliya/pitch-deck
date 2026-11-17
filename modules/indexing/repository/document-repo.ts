import { DocumentStatus, IndexingStage, type PrismaClient } from "@/lib/generated/prisma/client";

export function createDocumentRepo(database: PrismaClient) {
  return {
    getById(id: string) {
      return database.document.findUnique({ where: { id } });
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
    incrementProgress(id: string, pages: number, chunks: number) {
      return database.document.update({
        where: { id },
        data: { pagesProcessed: { increment: pages }, chunkCount: { increment: chunks } },
      });
    },
    upsertPage(
      documentId: string,
      page: { pageNumber: number; source: "TEXT_LAYER" | "OCR"; ocrConfidence?: number; charCount: number; chunkCount: number },
    ) {
      return database.documentPage.upsert({
        where: { documentId_pageNumber: { documentId, pageNumber: page.pageNumber } },
        create: { documentId, ...page },
        update: page,
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
