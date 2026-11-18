import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { Citation } from "../types";
export async function saveUserMessage(conversationId: string, content: string): Promise<string> {
  return (await prisma.message.create({ data: { conversationId, role: "USER", content }, select: { id: true } })).id;
}
export async function saveAssistantMessage(conversationId: string, content: string, citations: Citation[]): Promise<string> {
  const jsonCitations: Prisma.InputJsonArray = citations.map((citation) => ({
    n: citation.n,
    documentId: citation.documentId,
    fileName: citation.fileName,
    pageNumber: citation.pageNumber,
    chunkIndex: citation.chunkIndex,
  }));
  return (await prisma.message.create({
    data: { conversationId, role: "ASSISTANT", content, citations: jsonCitations },
    select: { id: true },
  })).id;
}
