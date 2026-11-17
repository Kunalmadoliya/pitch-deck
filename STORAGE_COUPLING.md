# Storage Coupling: Local Disk to ImageKit Migration Map

This document catalogues every point of coupling to local disk storage in the company policy reader codebase. Use this as a punch list when migrating the storage backend from local disk to ImageKit.

---

## 1. Storage Interface & Abstraction Layer

The repository already defines a storage contract in [`modules/indexing/storage/storage.interface.ts`](file:///i:/ai%20pitch%20deck/modules/indexing/storage/storage.interface.ts):

```typescript
export interface Storage {
  save(fileName: string, data: Uint8Array): Promise<string>;
  read(storagePath: string): Promise<Buffer>;
  remove(storagePath: string): Promise<void>;
}
```

- **Current Implementation**: [`modules/indexing/storage/local-storage.ts`](file:///i:/ai%20pitch%20deck/modules/indexing/storage/local-storage.ts) (uses `node:fs/promises` for `mkdir`, `readFile`, `rm`, `writeFile`).
- **Migration Path**: Implement `ImageKitStorage` implementing `Storage` using the server-side `imagekit` Node.js SDK.

---

## 2. Exhaustive List of Storage Coupling Points

### 1. Direct Filesystem & Storage Class Implementation
- **File**: `modules/indexing/storage/local-storage.ts`
  - **Coupling**: Imports `mkdir`, `readFile`, `rm`, `writeFile` from `node:fs/promises`, and `isAbsolute`, `join`, `relative`, `resolve` from `node:path`.
  - **Action**: Keep for local dev/testing, but introduce `ImageKitStorage` in `modules/indexing/storage/imagekit-storage.ts`.

### 2. Upload Directory Configuration
- **File**: `modules/indexing/config.ts` (lines 4 & 16)
  - **Coupling**: `UPLOAD_DIR: z.string().default("uploads")`.
  - **Action**: Add ImageKit environment variables (`IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_ID`) to `envSchema`.

### 3. Upload API Route
- **File**: `app/api/documents/route.ts` (lines 10 & 27)
  - **Coupling**:
    ```typescript
    const storage = new LocalStorage(indexingConfig.UPLOAD_DIR);
    ...
    const storagePath = await saveUpload(storage, input.fileName, new Uint8Array(await file.arrayBuffer()));
    ```
  - **Action**: Inject or instantiate `ImageKitStorage`. Note that `saveUpload` will return an ImageKit file URL / file ID instead of a local disk path.

### 4. Document Deletion Route
- **File**: `app/api/documents/[id]/route.ts` (lines 8 & 45)
  - **Coupling**:
    ```typescript
    const storage = new LocalStorage(indexingConfig.UPLOAD_DIR);
    ...
    await storage.remove(document.storagePath);
    ```
  - **Action**: Call `storage.remove(document.storagePath)`, where `ImageKitStorage.remove` calls `imagekit.deleteFile(fileId)`.

### 5. Inngest Background Job Orchestrator
- **File**: `inngest/functions/indexing.ts` (lines 12, 36, 44)
  - **Coupling**:
    ```typescript
    const storage = new LocalStorage(indexingConfig.UPLOAD_DIR);
    ...
    const inspection = await step.run("inspect", async () => {
      const result = await inspectDocument(storage, document);
    ...
    await step.run(`process-batch-${index + 1}`, () =>
      processPageBatch(storage, repo, { ... })
    );
    ```
  - **Action**: Pass `ImageKitStorage` instance.

### 6. Document Inspection Pipeline Step
- **File**: `modules/indexing/pipeline/inspect-document.ts` (lines 11)
  - **Coupling**:
    ```typescript
    const pageCount = kind === "pdf" ? await getPdfPageCount(await storage.read(document.storagePath)) : 1;
    ```
  - **Action**: `storage.read(document.storagePath)` will download the file buffer from the ImageKit URL instead of reading from disk.

### 7. Batch Processing Pipeline Step
- **File**: `modules/indexing/pipeline/process-page-batch.ts` (line 17)
  - **Coupling**:
    ```typescript
    const data = await storage.read(input.storagePath);
    ```
  - **Action**: `storage.read` fetches the remote file buffer via HTTPS into memory.

### 8. Upload Helper
- **File**: `modules/indexing/upload/save-upload.ts` (line 3)
  - **Coupling**: Calls `storage.save(fileName, data)`. Abstracted via `Storage` interface; behavior changes automatically when new storage provider is supplied.

### 9. Database Schema (`prisma/schema.prisma`)
- **Model**: `Document` (line 61)
  - **Field**: `storagePath String`
  - **Current Content**: Absolute or relative local filesystem path (e.g. `I:\ai pitch deck\uploads\1731862000-policy.pdf`).
  - **ImageKit Content**: Store either the ImageKit `fileId` or the ImageKit CDN URL.

### 10. Missing Dependencies
- **Package**: `package.json` currently has `@imagekit/next` installed, but does **not** have the official Node backend SDK:
  - Required: `imagekit` (`pnpm add imagekit`).
