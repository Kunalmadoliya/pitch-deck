import { IndexingStage } from "@/lib/generated/prisma/client";
import { createDocumentRepo } from "@/modules/indexing/repository/document-repo";
import { indexingConfig } from "@/modules/indexing/config";
import { createStorage } from "@/modules/indexing/storage/create-storage";
import { InvalidUploadError, sanitizeErrorMessage } from "@/modules/indexing/errors";
import { finalizeDocument } from "@/modules/indexing/pipeline/finalize-document";
import { inspectDocument } from "@/modules/indexing/pipeline/inspect-document";
import { processPageBatch } from "@/modules/indexing/pipeline/process-page-batch";
import { splitPageBatches } from "@/modules/indexing/pipeline/split-page-batches";
import { logIndexingEvent, withIndexingLogging } from "@/modules/indexing/logger";
import { prisma } from "@/lib/prisma";
import { inngest } from "../client";
import { NonRetriableError } from "inngest";

export const indexDocument = inngest.createFunction(
  {
    id: "index-document",
    name: "Index document",
    retries: 3,
    concurrency: 2,
    idempotency: "event.data.documentId",
    triggers: [{ event: "document/uploaded" }],
    onFailure: async ({ event, error, step }) => {
      const documentId = event.data.event.data.documentId;
      const repo = createDocumentRepo(prisma);
      const document = await step.run("load-failed-document", () =>
        withIndexingLogging(documentId, "load-failed-document", () => repo.getById(documentId)),
      );
      if (document && error.message.includes("InvalidUploadError")) {
        await step.run("delete-invalid-upload", async () => {
          try {
            await withIndexingLogging(documentId, "delete-invalid-upload", () =>
              createStorage().remove(document.storageFileId),
            );
          } catch (cleanupError) {
            logIndexingEvent("error", {
              documentId,
              stage: "delete-invalid-upload",
              errorCode: cleanupError instanceof Error ? cleanupError.name : "UNKNOWN",
            });
          }
        });
      }
      await step.run("mark-failed", () =>
        withIndexingLogging(documentId, "mark-failed", () => repo.fail(documentId, sanitizeErrorMessage(error))),
      );
    },
  },
  async ({ event, step }) => {
    const repo = createDocumentRepo(prisma);
    const document = await step.run("load-document", () =>
      withIndexingLogging(event.data.documentId, "load-document", () => repo.getById(event.data.documentId)),
    );
    if (!document || document.userId !== event.data.userId) {
      throw new Error("Document was not found");
    }

    const inspection = await step.run("inspect", () =>
      withIndexingLogging(document.id, "inspect", async () => {
        try {
          const result = await inspectDocument(createStorage(), document);
          await repo.setInspecting(document.id, result.pageCount);
          return result;
        } catch (error) {
          if (error instanceof InvalidUploadError) {
            throw new NonRetriableError(error.message, { cause: error });
          }
          throw error;
        }
      }),
    );

    const batches = splitPageBatches(inspection.pageCount, indexingConfig.PAGE_BATCH_SIZE);
    for (const [index, pageNumbers] of batches.entries()) {
      await step.run(`process-batch-${index + 1}`, () =>
        withIndexingLogging(document.id, `process-batch-${index + 1}`, () =>
          processPageBatch(createStorage(), repo, {
            documentId: document.id,
            userId: document.userId,
            fileName: document.fileName,
            storageFileId: document.storageFileId,
            kind: inspection.kind,
            pageNumbers,
          }),
        ),
      );
    }

    await step.run("finalize", () =>
      withIndexingLogging(document.id, "finalize", () => finalizeDocument(repo, document.id)),
    );
    return { documentId: document.id, status: IndexingStage.DONE };
  },
);