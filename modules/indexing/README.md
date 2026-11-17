# Indexing module

The indexing flow is:

```text
GET /api/upload-auth
  -> client uploads directly to ImageKit
  -> POST /api/documents
  -> document/uploaded
  -> inspect
  -> process-batch-N
       extract text layer or OCR
       chunk per page
       embed
       upsert Pinecone vectors
       persist page progress
  -> finalize
```

`modules/indexing` contains the ImageKit storage, extraction, OCR, chunking,
embedding, vector-store, repository, and pipeline adapters used by the Inngest
function. The registration route performs only authentication, validation,
database coordination, and event dispatch.

Vector IDs use `documentId:pageNumber:chunkIndex`; the user ID is the Pinecone
namespace. Querying can use the stored metadata to provide document and page
citations without re-reading source files. ImageKit file paths are private and
are verified against server-side metadata before indexing.

## Client upload sequence

```ts
const auth = await fetch("/api/upload-auth").then((response) => response.json());
const uploadResponse = await upload({
  file,
  fileName: file.name,
  publicKey: auth.publicKey,
  token: auth.token,
  expire: auth.expire,
  signature: auth.signature,
  folder: `/policy-docs/${userId}`,
  isPrivateFile: true,
  useUniqueFileName: true,
});

await fetch("/api/documents", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fileId: uploadResponse.fileId,
    filePath: uploadResponse.filePath,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  }),
});
```
