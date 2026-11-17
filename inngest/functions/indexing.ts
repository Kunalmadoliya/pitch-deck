import { IndexingStage } from "@/lib/generated/prisma/client";
import { createDocumentRepo } from "@/modules/indexing/repository/document-repo";
import { indexingConfig } from "@/modules/indexing/config";
import { finalizeDocument } from "@/modules/indexing/pipeline/finalize-document";
import { inspectDocument } from "@/modules/indexing/pipeline/inspect-document";
import { processPageBatch } from "@/modules/indexing/pipeline/process-page-batch";
import { splitPageBatches } from "@/modules/indexing/pipeline/split-page-batches";
import { LocalStorage } from "@/modules/indexing/storage/local-storage";
import { prisma } from "@/lib/prisma";
import { inngest } from "../client";

const storage = new LocalStorage(indexingConfig.UPLOAD_DIR);

export const indexDocument = inngest.createFunction(
  {
    id: "index-document",
    name: "Index document",
    retries: 3,
    concurrency: 2,
    idempotency: "event.data.documentId",
    triggers: [{ event: "document/uploaded" }],
    onFailure: async ({ event, error, step }) => {
      await step.run("mark-failed", () =>
        createDocumentRepo(prisma).fail(event.data.event.data.documentId, error.message),
      );
    },
  },
  async ({ event, step }) => {
    const repo = createDocumentRepo(prisma);
    const document = await step.run("load-document", () => repo.getById(event.data.documentId));
    if (!document || document.userId !== event.data.userId) {
      throw new Error("Document was not found");
    }

    const inspection = await step.run("inspect", async () => {
      const result = await inspectDocument(storage, document);
      await repo.setInspecting(document.id, result.pageCount);
      return result;
    });

    const batches = splitPageBatches(inspection.pageCount, indexingConfig.PAGE_BATCH_SIZE);
    for (const [index, pageNumbers] of batches.entries()) {
      await step.run(`process-batch-${index + 1}`, () =>
        processPageBatch(storage, repo, {
          documentId: document.id,
          userId: document.userId,
          fileName: document.fileName,
          storagePath: document.storagePath,
          kind: inspection.kind,
          pageNumbers,
        }),
      );
    }

    await step.run("finalize", () => finalizeDocument(repo, document.id));
    return { documentId: document.id, status: IndexingStage.DONE };
  },
);