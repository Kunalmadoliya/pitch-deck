# Read-Only Audit Report: Indexing Pipeline & Architecture

**Date**: November 17, 2026  
**Project**: Company Policy Reader (`ai-pitch`)  
**Stack**: Next.js 16 (App Router), Prisma 7, Better Auth, Inngest v4, Pinecone, LangChain, Tesseract.js, pdfjs-dist, @napi-rs/canvas

---

## 1. FOLDER TREE

Full tree of `app/api`, `inngest`, `modules/indexing`, `prisma`, `lib`, and `uploads/`:

```text
app/api/
├── auth/
│   └── [...all]/
│       └── route.ts
├── documents/
│   ├── [id]/
│   │   └── route.ts
│   └── route.ts
└── inngest/
    └── route.ts
inngest/
├── client.ts
├── index.ts
└── functions/
    ├── indexing.ts
    └── query.ts
modules/indexing/
├── __tests__/
│   ├── build-metadata.test.ts
│   ├── chunk-page.test.ts
│   ├── needs-ocr.test.ts
│   └── split-page-batches.test.ts
├── chunking/
│   └── chunk-page.ts
├── detection/
│   ├── detect-file-kind.ts
│   └── needs-ocr.ts
├── embeddings/
│   ├── embed-chunks.ts
│   └── embedder.ts
├── extraction/
│   ├── extract-pages.ts
│   ├── extract-pdf-page-text.ts
│   ├── get-pdf-page-count.ts
│   ├── ocr-page.ts
│   ├── ocr-worker.ts
│   └── render-pdf-page.ts
├── pipeline/
│   ├── finalize-document.ts
│   ├── inspect-document.ts
│   ├── process-page-batch.ts
│   └── split-page-batches.ts
├── repository/
│   └── document-repo.ts
├── storage/
│   ├── local-storage.ts
│   └── storage.interface.ts
├── upload/
│   ├── save-upload.ts
│   └── validate-upload.ts
├── vector-store/
│   ├── build-metadata.ts
│   ├── delete-document-vectors.ts
│   ├── pinecone-client.ts
│   └── upsert-chunks.ts
├── config.ts
├── errors.ts
├── logger.ts
├── README.md
└── types.ts
prisma/
├── migrations/
│   ├── 20261116155050_init/
│   │   └── migration.sql
│   ├── 20261116161332_add_better_auth/
│   │   └── migration.sql
│   ├── 20261117160632_add_documents_and_conversations/
│   │   └── migration.sql
│   └── migration_lock.toml
└── schema.prisma
lib/
├── auth-client.ts
├── highlighter.tsx
├── prisma.ts
├── query-client.ts
└── generated/ (Prisma client generated output)
uploads/
└── [Directory does not yet exist on disk; created on first upload]
```

---

## 2. STATE OF THE REPO

### Git Status (`git status --short`)
```text
 M .env.example
 M next.config.ts
 M package.json
 M pnpm-lock.yaml
 M pnpm-workspace.yaml
 M prisma/schema.prisma
?? AUDIT_REPORT.md
?? app/api/documents/
?? app/api/inngest/
?? inngest/
?? modules/
?? prisma/migrations/20261117160632_add_documents_and_conversations/
```

### Git Log (`git log --oneline -5`)
```text
abeb585 done
28b47bc fix: add postinstall prisma generate for Vercel build
2fd12fe feat: enable building for better-sqlite3 in pnpm workspace configuration
26a4033 feat: add new drafting components including DashedButton, DashedGrid, DrawLine, PipelineFlow, PolicyViewerSketch, and PopIn; implement site header and footer with theme toggle
6e58e08 feat(auth): implement user authentication models and migration
```

### Prisma Migration Status (`pnpm prisma migrate status`)
- Migration `20261117160632_add_documents_and_conversations` **exists** in `prisma/migrations/`.
- **Applied**: **YES**. `pnpm prisma migrate status` confirms:
  > *3 migrations found in prisma/migrations*  
  > *Database schema is up to date!*

### Installed Package Versions (Relevant Dependencies)

| Package | In `package.json` | Installed Version |
| :--- | :--- | :--- |
| `zod` |  Yes | `^4.6.7` |
| `tesseract.js` |  Yes | `^7.0.0` |
| `pdfjs-dist` |  Yes | `^6.5.438` |
| `@napi-rs/canvas` |  Yes | `^1.1.1` |
| `@langchain/core` |  Yes | `^1.4.1` |
| `@langchain/openai` |  Yes | `^1.8.4` |
| `@langchain/textsplitters` |  Yes | `^1.0.2` |
| `@pinecone-database/pinecone` |  Yes | `^9.2.0` |
| `@imagekit/next` |  Yes | `^2.1.6` (React frontend components only) |
| `imagekit` | ❌ No | **Not installed** (backend Node SDK missing) |
| `inngest` |  Yes | `^4.26.2` |
| `vitest` |  Yes (dev) | `^5.1.0` |

### `next.config.ts` External Packages
- **Has `serverExternalPackages`**: **YES**
- **Configured packages**:
  ```typescript
  serverExternalPackages: ["tesseract.js", "@napi-rs/canvas", "pdfjs-dist"]
  ```

### Environment Variable Comparison (Names Only)

- **Keys in `.env.example`**:
  `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `INNGEST_DEV`, `PINECONE_API_KEY`, `PINECONE_INDEX`, `OPENAI_API_KEY`, `UPLOAD_DIR`, `OCR_LANG`, `PAGE_BATCH_SIZE`, `OCR_TEXT_THRESHOLD`, `CHUNK_SIZE`, `CHUNK_OVERLAP`.

- **Keys present in `.env` but missing from `.env.example`**:
  `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_ID`.

- **Required indexing keys present in `.env.example` but missing from `.env`**:
  `PINECONE_API_KEY`, `PINECONE_INDEX`, `OPENAI_API_KEY` (indexing Inngest steps will throw runtime errors until these are provided in `.env`).

---

## 3. FILE MAP

| Path | One-Line Purpose | Status |
| :--- | :--- | :--- |
| `app/api/auth/[...all]/route.ts` | Delegates Next.js auth requests to Better Auth handler | **complete** |
| `app/api/documents/route.ts` | Handles file upload (validates, stores, queues Inngest event) & lists user documents | **complete** |
| `app/api/documents/[id]/route.ts` | Retrieves single document status & handles document deletion (Pinecone, disk, DB) | **complete** |
| `app/api/inngest/route.ts` | Exposes Inngest webhook route via `serve({ client, functions })` | **complete** |
| `inngest/client.ts` | Initializes and exports Inngest client with ID `"ai-pitch"` | **complete** |
| `inngest/index.ts` | Re-exports Inngest client and registers `[indexDocument]` function array | **complete** |
| `inngest/functions/indexing.ts` | Inngest background job orchestration for document inspection, batch processing & finalization | **complete** |
| `inngest/functions/query.ts` | Query orchestration step placeholder | **stub** |
| `modules/indexing/config.ts` | Zod schema validation for indexing environment variables and constants | **complete** |
| `modules/indexing/errors.ts` | Error classes: `IndexingError`, `UnsupportedFileError`, `OcrError`, `EmbeddingError` | **complete** |
| `modules/indexing/logger.ts` | Standardized JSON telemetry logger (`logIndexingEvent`) | **complete** |
| `modules/indexing/types.ts` | Domain types for `FileKind`, `PageText`, `Chunk`, `VectorRecord`, `BatchSummary` | **complete** |
| `modules/indexing/chunking/chunk-page.ts` | Splits single-page text into chunks with LangChain Recursive splitter, preserving page | **complete** |
| `modules/indexing/detection/detect-file-kind.ts` | Classifies MIME types into `"pdf"` or `"image"` | **complete** |
| `modules/indexing/detection/needs-ocr.ts` | Evaluates if extracted text length falls below minimum OCR threshold | **complete** |
| `modules/indexing/embeddings/embed-chunks.ts` | Batches chunk text in groups of 32 for embedding generation | **complete** |
| `modules/indexing/embeddings/embedder.ts` | Instantiates LangChain `OpenAIEmbeddings` using `text-embedding-3-small` | **complete** |
| `modules/indexing/extraction/extract-pages.ts` | Extracts text per page, choosing between PDF text layer, canvas render + OCR, or image OCR | **complete** |
| `modules/indexing/extraction/extract-pdf-page-text.ts` | Extracts text layer from a specific PDF page using `pdfjs-dist` | **complete** |
| `modules/indexing/extraction/get-pdf-page-count.ts` | Extracts total page count from a PDF buffer via `pdfjs-dist` | **complete** |
| `modules/indexing/extraction/ocr-page.ts` | Recognizes text and confidence score from an image buffer via Tesseract.js | **complete** |
| `modules/indexing/extraction/ocr-worker.ts` | Creates and automatically terminates Tesseract workers inside a `finally` block | **complete** |
| `modules/indexing/extraction/render-pdf-page.ts` | Renders a PDF page to a PNG buffer using `@napi-rs/canvas` at 2x scale | **complete** |
| `modules/indexing/pipeline/finalize-document.ts` | Updates document record to `INDEXED` status with `stage: DONE` | **complete** |
| `modules/indexing/pipeline/inspect-document.ts` | Reads file to discover file kind and page count | **complete** |
| `modules/indexing/pipeline/process-page-batch.ts` | Processes a batch of pages: extraction, chunking, embedding, Pinecone upsert, page DB upsert | **complete** |
| `modules/indexing/pipeline/split-page-batches.ts` | Splits total page range into discrete arrays bounded by `PAGE_BATCH_SIZE` | **complete** |
| `modules/indexing/repository/document-repo.ts` | Prisma data access layer for documents and document pages with atomic increments | **complete** |
| `modules/indexing/storage/local-storage.ts` | Disk storage implementation with path-traversal prevention | **complete** |
| `modules/indexing/storage/storage.interface.ts` | Storage abstraction interface (`save`, `read`, `remove`) | **complete** |
| `modules/indexing/upload/save-upload.ts` | Delegates binary upload buffer saving to storage provider | **complete** |
| `modules/indexing/upload/validate-upload.ts` | Zod schema validation for file name, MIME type, and 50MB size limit | **complete** |
| `modules/indexing/vector-store/build-metadata.ts` | Builds Pinecone vector metadata including citations, confidence, and text | **complete** |
| `modules/indexing/vector-store/delete-document-vectors.ts` | Deletes all vectors matching a `documentId` within a user's namespace | **complete** |
| `modules/indexing/vector-store/pinecone-client.ts` | Returns Pinecone index client instance | **complete** |
| `modules/indexing/vector-store/upsert-chunks.ts` | Upserts vector records into a target Pinecone namespace | **complete** |
| `modules/indexing/__tests__/build-metadata.test.ts` | Unit test for vector metadata builder | **complete** |
| `modules/indexing/__tests__/chunk-page.test.ts` | Unit test verifying chunks never lose or cross page boundaries | **complete** |
| `modules/indexing/__tests__/needs-ocr.test.ts` | Unit test for OCR character threshold evaluation | **complete** |
| `modules/indexing/__tests__/split-page-batches.test.ts` | Unit test for 1-based page batch splitting | **complete** |

---

## 4. FULL CONTENTS OF REQUESTED FILES

### 1. `Document` and `DocumentPage` models from `prisma/schema.prisma`
```prisma
model Document {
  id             String         @id @default(cuid())
  userId         String
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  fileName       String
  mimeType       String
  sizeBytes      Int
  storagePath    String
  status         DocumentStatus @default(UPLOADED)
  stage          IndexingStage  @default(QUEUED)
  pageCount      Int?
  pagesProcessed Int            @default(0)
  chunkCount     Int            @default(0)
  errorMessage   String?
  indexedAt      DateTime?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  pages          DocumentPage[]

  @@index([userId, status])
  @@index([userId, createdAt])
  @@map("document")
}

model DocumentPage {
  id            String     @id @default(cuid())
  documentId    String
  document      Document   @relation(fields: [documentId], references: [id], onDelete: Cascade)
  pageNumber    Int
  source        PageSource
  ocrConfidence Float?
  charCount     Int
  chunkCount    Int        @default(0)
  createdAt     DateTime   @default(now())

  @@unique([documentId, pageNumber])
  @@map("document_page")
}
```

### 2. `inngest/functions/indexing.ts`
```typescript
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
```

### 3. `inngest/index.ts`
```typescript
//here we are exporting the inngest client and the functions array so that we can use them in other parts of the application

import { inngest } from "./client";
import { indexDocument } from "./functions/indexing";

export { inngest };
export const functions = [indexDocument];
```

### 4. `app/api/documents/route.ts`
```typescript
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest";
import { indexingConfig } from "@/modules/indexing/config";
import { saveUpload } from "@/modules/indexing/upload/save-upload";
import { validateUpload } from "@/modules/indexing/upload/validate-upload";
import { LocalStorage } from "@/modules/indexing/storage/local-storage";
import { DocumentStatus, IndexingStage } from "@/lib/generated/prisma/client";

const storage = new LocalStorage(indexingConfig.UPLOAD_DIR);

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "A file is required" }, { status: 400 });

  let input;
  try {
    input = validateUpload({ fileName: file.name, mimeType: file.type, sizeBytes: file.size });
  } catch {
    return Response.json({ error: "Invalid file type or size" }, { status: 400 });
  }

  const storagePath = await saveUpload(storage, input.fileName, new Uint8Array(await file.arrayBuffer()));
  const document = await prisma.document.create({
    data: {
      userId: session.user.id,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storagePath,
      status: DocumentStatus.UPLOADED,
      stage: IndexingStage.QUEUED,
    },
    select: { id: true, status: true, stage: true },
  });
  await inngest.send({ name: "document/uploaded", data: { documentId: document.id, userId: session.user.id } });
  return Response.json(document, { status: 202 });
}

export async function GET(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
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
  return Response.json(documents);
}
```

### 5. `app/api/documents/[id]/route.ts`
```typescript
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { indexingConfig } from "@/modules/indexing/config";
import { LocalStorage } from "@/modules/indexing/storage/local-storage";
import { createPineconeIndex } from "@/modules/indexing/vector-store/pinecone-client";
import { deleteDocumentVectors } from "@/modules/indexing/vector-store/delete-document-vectors";

const storage = new LocalStorage(indexingConfig.UPLOAD_DIR);

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
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
  if (!document) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(document);
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const document = await prisma.document.findFirst({ where: { id, userId: session.user.id } });
  if (!document) return Response.json({ error: "Not found" }, { status: 404 });
  await deleteDocumentVectors(createPineconeIndex(), session.user.id, id);
  await storage.remove(document.storagePath);
  await prisma.document.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
```

### 6. `app/api/inngest/route.ts`
```typescript
import { serve } from "inngest/next";
import { functions, inngest } from "@/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
```

### 7. `modules/indexing/config.ts`
```typescript
import { z } from "zod";

const envSchema = z.object({
  UPLOAD_DIR: z.string().default("uploads"),
  OCR_LANG: z.string().default("eng"),
  PAGE_BATCH_SIZE: z.coerce.number().int().positive().default(3),
  OCR_TEXT_THRESHOLD: z.coerce.number().int().nonnegative().default(50),
  CHUNK_SIZE: z.coerce.number().int().positive().default(1000),
  CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(150),
  OPENAI_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),
});

export const indexingConfig = envSchema.parse({
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  OCR_LANG: process.env.OCR_LANG,
  PAGE_BATCH_SIZE: process.env.PAGE_BATCH_SIZE,
  OCR_TEXT_THRESHOLD: process.env.OCR_TEXT_THRESHOLD,
  CHUNK_SIZE: process.env.CHUNK_SIZE,
  CHUNK_OVERLAP: process.env.CHUNK_OVERLAP,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX: process.env.PINECONE_INDEX,
});

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSION = 1536;
```

### 8. `modules/indexing/storage/*`

#### `modules/indexing/storage/storage.interface.ts`
```typescript
export interface Storage {
  save(fileName: string, data: Uint8Array): Promise<string>;
  read(storagePath: string): Promise<Buffer>;
  remove(storagePath: string): Promise<void>;
}
```

#### `modules/indexing/storage/local-storage.ts`
```typescript
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import type { Storage } from "./storage.interface";

export class LocalStorage implements Storage {
  private readonly root: string;

  constructor(root: string) {
    this.root = resolve(root);
  }

  async save(fileName: string, data: Uint8Array): Promise<string> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = join(this.root, `${Date.now()}-${safeName}`);
    await mkdir(this.root, { recursive: true });
    await writeFile(storagePath, data);
    return storagePath;
  }

  async read(storagePath: string): Promise<Buffer> {
    this.assertInsideRoot(storagePath);
    return readFile(storagePath);
  }

  async remove(storagePath: string): Promise<void> {
    this.assertInsideRoot(storagePath);
    await rm(storagePath, { force: true });
  }

  private assertInsideRoot(storagePath: string): void {
    if (!isAbsolute(storagePath) || relative(this.root, resolve(storagePath)).startsWith("..")) {
      throw new Error("Storage path is outside the configured upload directory");
    }
  }
}
```

### 9. `modules/indexing/upload/*`

#### `modules/indexing/upload/save-upload.ts`
```typescript
import type { Storage } from "../storage/storage.interface";

export async function saveUpload(storage: Storage, fileName: string, data: Uint8Array): Promise<string> {
  return storage.save(fileName, data);
}
```

#### `modules/indexing/upload/validate-upload.ts`
```typescript
import { z } from "zod";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

export const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(allowedMimeTypes),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

export function validateUpload(input: unknown) {
  return uploadSchema.parse(input);
}
```

### 10. `modules/indexing/pipeline/process-page-batch.ts`
```typescript
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
```

---

## 5. FLOW AS IMPLEMENTED TODAY

```text
User POST /api/documents (Multipart)
       │
       ▼
[Validate Upload] ───► [Save to LocalStorage] ───► [Prisma Document created: UPLOADED, QUEUED]
                                                                │
                                                                ▼
                                                [Inngest Event: document/uploaded]
                                                                │
                                                                ▼
                                                 (HTTP 202 Accepted returned)
```

### Step 1: Upload API Route (`POST /api/documents`)
1. Verifies Better Auth session (`auth.api.getSession`). Returns `401 Unauthorized` if not authenticated.
2. Extracts multipart `file` from request FormData.
3. Validates file using `validateUpload` (allowed types: PDF, PNG, JPEG, WEBP; max 50 MB).
4. Saves raw bytes via `LocalStorage.save`, writing to `uploads/<timestamp>-<safeName>`.
5. Inserts a `Document` record in PostgreSQL with `status: UPLOADED`, `stage: QUEUED`, storing `storagePath`.
6. Dispatches event `document/uploaded` with `{ documentId, userId }` to Inngest.
7. Immediately returns `HTTP 202 Accepted` with `{ id, status, stage }`. **No CPU-heavy operations run in the HTTP request.**

### Step 2: Inngest Function (`index-document`)
- **Concurrency**: `2`
- **Retries**: `3`
- **Idempotency**: Keyed on `event.data.documentId`.
- **Failure Handling**: `onFailure` runs a `mark-failed` step calling `documentRepo.fail()`, updating `status: FAILED` and truncating `errorMessage` to 500 characters.

#### Execution Steps:
1. **`step.run("load-document")`**:
   - Fetches document by ID. Asserts `document.userId === event.data.userId`.
2. **`step.run("inspect")`**:
   - Calls `inspectDocument(storage, document)`.
   - Reads the file via `storage.read(document.storagePath)`.
   - If PDF, gets total page count via `pdfjs-dist`; if image, defaults to `1`.
   - Updates document in DB: `status: PROCESSING`, `stage: INSPECTING`, and writes `pageCount`.
   - Returns `{ pageCount, kind }`.
3. **Batch Loop: `step.run("process-batch-X")`**:
   - `splitPageBatches` partitions pages into slices of `PAGE_BATCH_SIZE` (default 3).
   - For each batch, `processPageBatch` executes:
     - **Read**: Loads file buffer via `storage.read(storagePath)`.
     - **Extract**: Sets `stage: EXTRACTING`. Calls `extractPages()`. For PDF, reads text layer with `pdfjs-dist`. If text length < `OCR_TEXT_THRESHOLD` (50 chars), renders page to PNG using `@napi-rs/canvas` at 2x scale and runs Tesseract OCR. If image, runs Tesseract OCR directly.
     - **OCR Worker**: Managed by `withOcrWorker()`, guaranteeing `worker.terminate()` in a `finally` block.
     - **Chunk**: Sets `stage: CHUNKING`. Runs LangChain `RecursiveCharacterTextSplitter` on single-page text with `CHUNK_SIZE: 1000`, `CHUNK_OVERLAP: 150`. Chunks are strictly page-scoped.
     - **Embed**: Sets `stage: EMBEDDING`. Generates vectors in batches of 32 using LangChain `OpenAIEmbeddings` (`text-embedding-3-small`, 1536 dim).
     - **Deterministic ID**: Assigns ID `${documentId}:${pageNumber}:${chunkIndex}`.
     - **Metadata**: Attaches `documentId`, `userId`, `fileName`, `pageNumber`, `chunkIndex`, `source`, `ocrConfidence`, and `text`.
     - **Upsert**: Sets `stage: UPSERTING`. Writes vectors to Pinecone under namespace `userId`.
     - **DB Update**: Upserts `DocumentPage` records (`pageNumber`, `source`, `ocrConfidence`, `charCount`, `chunkCount`) and atomically increments `pagesProcessed` and `chunkCount`.
     - **Step Output**: Returns `{ pages, chunks }` (lightweight primitives; text and vectors are not returned).
4. **`step.run("finalize")`**:
   - Sets document `status: INDEXED`, `stage: DONE`, `indexedAt: new Date()`.

### Step 3: Delete Flow (`DELETE /api/documents/[id]`)
1. Verifies Better Auth session and checks document ownership (`where: { id, userId }`).
2. Calls `deleteDocumentVectors` in Pinecone, deleting all vectors where `documentId == id` within the user's namespace.
3. Deletes local file via `storage.remove(document.storagePath)`.
4. Deletes `Document` record in PostgreSQL (cascading deletes `DocumentPage` records).
5. Returns `HTTP 204 No Content`.

---

## 6. SPEC COMPLIANCE CHECK

| Spec Requirement | Compliant? | Code Reference |
| :--- | :---: | :--- |
| **1. No slow work inside API route** | **YES** | `app/api/documents/route.ts#L12-L42`: Only saves upload buffer, creates DB record, fires Inngest event, returns 202. |
| **2. Inngest function contains orchestration only** | **YES** | `inngest/functions/indexing.ts`: Delegates work to `inspectDocument`, `splitPageBatches`, `processPageBatch`, `finalizeDocument`. |
| **3. Steps return only small data (no text or vectors)** | **YES** | `inspect` returns `{ pageCount, kind }`; `process-batch-X` returns `{ pages, chunks }`; `finalize` returns `{ documentId, status }`. |
| **4. Chunks never cross page boundaries** | **YES** | `modules/indexing/chunking/chunk-page.ts#L13`: `splitter.createDocuments([page.text])` runs per page. Verified in `chunk-page.test.ts`. |
| **5. Deterministic Vector IDs & user namespace** | **YES** | `modules/indexing/pipeline/process-page-batch.ts#L25`: `id: \`${input.documentId}:${chunk.pageNumber}:${chunk.chunkIndex}\``; namespace is `input.userId`. |
| **6. Pinecone metadata includes all required fields** | **YES** | `modules/indexing/vector-store/build-metadata.ts#L8-L16`: Includes `documentId`, `userId`, `fileName`, `pageNumber`, `chunkIndex`, `source`, `ocrConfidence`, `text`. |
| **7. OCR worker terminated in `finally`** | **YES** | `modules/indexing/extraction/ocr-worker.ts#L8-L10`: `try { ... } finally { await worker.terminate(); }`. |
| **8. Route checks Better Auth session & ownership** | **YES** | `app/api/documents/route.ts#L13`, `app/api/documents/[id]/route.ts#L14,L40`, and `indexing.ts#L31`. |
| **9. No hardcoded numbers or models in logic files** | **PARTIAL** | Config parameters (`PAGE_BATCH_SIZE`, `OCR_TEXT_THRESHOLD`, `CHUNK_SIZE`, `CHUNK_OVERLAP`, `OCR_LANG`, `EMBEDDING_MODEL`) are centralized in `config.ts`. Minor constants remain: 50MB in `validate-upload.ts`, `scale: 2` in `render-pdf-page.ts`, `batchSize = 32` in `embed-chunks.ts`. |
| **10. No document text in logs or error messages** | **YES** | `modules/indexing/logger.ts` logs only `{ event, documentId, stage, durationMs, errorCode }`. No content logs. |
| **11. `onFailure` sets FAILED with safe message** | **YES** | `inngest/functions/indexing.ts#L22-L26` runs `mark-failed` step. `document-repo.ts#L66` truncates message to 500 characters. |
| **12. No `any` types (`pnpm tsc --noEmit`)** | **YES** | TypeScript compile completes with 0 errors across the entire codebase. |

---

## 7. TESTS AND BUILD

### Vitest (`pnpm test`)
```text
$ vitest run

 RUN  v5.1.0 I:/ai pitch deck

 ✓ modules/indexing/__tests__/needs-ocr.test.ts (1 test) 4ms
 ✓ modules/indexing/__tests__/build-metadata.test.ts (1 test) 5ms
 ✓ modules/indexing/__tests__/split-page-batches.test.ts (1 test) 5ms
 ✓ modules/indexing/__tests__/chunk-page.test.ts (1 test) 4ms

 Test Files  4 passed (4)
      Tests  4 passed (4)
   Start at  22:13:12
   Duration  1.53s
```
**Status**:  **4 / 4 test files passed.**

### TypeScript Compiler (`pnpm tsc --noEmit`)
```text
$ pnpm tsc --noEmit
[Exit Code 0 — No errors]
```
**Status**:  **0 compilation errors.**

### ESLint (`pnpm lint`)
```text
$ eslint
✖ 6 problems (5 errors, 1 warning)

I:\ai pitch deck\components\drafting\dashed-grid.tsx
  13:3  warning  'withOuterBorder' is assigned a value but never used  @typescript-eslint/no-unused-vars

I:\ai pitch deck\components\drafting\draw-line.tsx
  23:7  error  Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

I:\ai pitch deck\components\drafting\pop-in.tsx
  21:7  error  Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

I:\ai pitch deck\components\theme-toggle.tsx
  10:5  error  Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

I:\ai pitch deck\components\ui\carousel.tsx
  98:5  error  Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

I:\ai pitch deck\hooks\use-mobile.ts
  14:5  error  Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect
```
**Status**: ❌ **Failed with 5 errors, 1 warning.**  
*(Note: All failures stem from React 19 `react-hooks/set-state-in-effect` rules in pre-existing UI components; zero lint errors exist in `modules/indexing/`, `app/api/documents/`, or `inngest/`).*

---

## 8. PROBLEMS & DEVIATIONS

1. **Missing Backend `imagekit` SDK**:
   - `package.json` contains `@imagekit/next`, which is a client-side React UI library.
   - The official server SDK (`imagekit`) is **not installed**, meaning backend uploads cannot yet be dispatched to ImageKit.
2. **Missing Local Credentials in `.env`**:
   - `PINECONE_API_KEY`, `PINECONE_INDEX`, and `OPENAI_API_KEY` are not set in `.env`. Running the Inngest background job will fail at the embedding or vector upsert step.
3. **Synchronous Vector Deletion on HTTP DELETE**:
   - In `app/api/documents/[id]/route.ts#L44-L46`, Pinecone vector deletion (`deleteMany`), local disk removal, and database deletion are awaited synchronously inside the HTTP handler. For large documents, this can add seconds of latency to the HTTP response and should ideally be delegated to an Inngest background event (`document/deleted`).
4. **`inngest/functions/query.ts` is a Stub**:
   - `inngest/functions/query.ts` contains only a 1-line comment and no implementation.
5. **No Upload UI Connected Yet**:
   - The frontend landing page does not contain an actual file input or upload form wired to `POST /api/documents`.

---

## 9. STORAGE COUPLING

The following locations are tightly coupled to local disk storage and must be updated when migrating to ImageKit:

1. **`modules/indexing/config.ts` (Line 4 & 16)**:
   - Configures `UPLOAD_DIR: z.string().default("uploads")`.
2. **`modules/indexing/storage/local-storage.ts` (Lines 1–35)**:
   - Contains direct Node.js filesystem operations: `mkdir`, `readFile`, `rm`, `writeFile` from `node:fs/promises`, and path traversal assertions.
   - *Target replacement*: Implement an `ImageKitStorage` class adhering to `Storage` (`storage.interface.ts`).
3. **`app/api/documents/route.ts` (Line 10 & 27)**:
   - Instantiates `const storage = new LocalStorage(indexingConfig.UPLOAD_DIR);` and passes it to `saveUpload`.
4. **`app/api/documents/[id]/route.ts` (Line 8 & 45)**:
   - Instantiates `LocalStorage` and calls `await storage.remove(document.storagePath)`.
5. **`inngest/functions/indexing.ts` (Line 12 & 36, 44)**:
   - Instantiates `LocalStorage` and passes it to `inspectDocument` and `processPageBatch`.
6. **`modules/indexing/pipeline/inspect-document.ts` (Line 11)**:
   - Calls `await storage.read(document.storagePath)`.
7. **`modules/indexing/pipeline/process-page-batch.ts` (Line 17)**:
   - Calls `await storage.read(input.storagePath)`.
8. **`prisma/schema.prisma` (`Document.storagePath`)**:
   - The `Document` model stores `storagePath: String`. Currently, this stores an absolute local disk path (e.g. `I:\ai pitch deck\uploads\1710000000-policy.pdf`). In ImageKit, this should store the ImageKit file ID or file URL.
9. **Environment Configuration**:
   - `.env` already contains `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_ID`, but `.env.example` lacks them.
