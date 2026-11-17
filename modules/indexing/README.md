# Indexing module

The indexing flow is:

```text
POST /api/documents
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

`modules/indexing` contains the storage, extraction, OCR, chunking, embedding,
vector-store, repository, and pipeline adapters used by the Inngest function.
The API routes perform only authentication, validation, local file persistence,
database coordination, and event dispatch.

Vector IDs use `documentId:pageNumber:chunkIndex`; the user ID is the Pinecone
namespace. Querying can use the stored metadata to provide document and page
citations without re-reading source files.
