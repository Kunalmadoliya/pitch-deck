import { createEmbedder } from "@/modules/indexing/embeddings/embedder";
import { prisma } from "@/lib/prisma";
import { queryConfig } from "../config";
import { searchPinecone } from "../retrieval/search-pinecone";
import { RetrievalError } from "../errors";
import type { Chunk, SearchQuery } from "../types";
export async function contentAdapter(userId: string, queries: SearchQuery[], documentIds?: string[]): Promise<Chunk[][]> {
  const embedder = createEmbedder();
  const ownedIds = documentIds?.length
    ? (await prisma.document.findMany({ where: { userId, id: { in: documentIds } }, select: { id: true } })).map((doc) => doc.id)
    : undefined;
  const vectors = await embedder.embedDocuments(queries.map((query) => query.text));
  const results = await Promise.allSettled(vectors.map((vector) => searchPinecone(userId, vector, queryConfig.PINECONE_TOP_K, ownedIds)));
  const successful = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  if (!successful.length && results.length) throw new RetrievalError();
  return successful;
}
