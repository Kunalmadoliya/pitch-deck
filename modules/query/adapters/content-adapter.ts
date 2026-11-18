import { prisma } from "@/lib/prisma";
import { queryConfig } from "../config";
import { searchPinecone } from "../retrieval/search-pinecone";
import { RetrievalError } from "../errors";
import type { Chunk, SearchQuery } from "../types";
export async function contentAdapter(userId: string, queries: SearchQuery[], documentIds?: string[]): Promise<Chunk[][]> {
  const ownedIds = documentIds?.length
    ? (await prisma.document.findMany({ where: { userId, id: { in: documentIds } }, select: { id: true } })).map((doc) => doc.id)
    : undefined;
  const results = await Promise.allSettled(
    queries.map((query) => searchPinecone(userId, query.text, queryConfig.PINECONE_TOP_K, ownedIds)),
  );
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[chat-retrieval] query failed", {
        errorName: result.reason instanceof Error ? result.reason.name : "UNKNOWN",
        errorMessage: result.reason instanceof Error ? result.reason.message : "UNKNOWN",
      });
    }
  });
  const successful = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  if (!successful.length && results.length) throw new RetrievalError();
  return successful;
}
