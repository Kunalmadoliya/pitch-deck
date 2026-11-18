import { prisma } from "@/lib/prisma";
import type { MetadataFact, MetadataIntent } from "../types";

export async function listDocuments(userId: string): Promise<MetadataFact[]> {
  const docs = await prisma.document.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, fileName: true, status: true } });
  return docs.map((doc) => ({ documentId: doc.id, text: `${doc.fileName} (${doc.status.toLowerCase()})` }));
}
export async function countDocuments(userId: string): Promise<MetadataFact[]> {
  const count = await prisma.document.count({ where: { userId } });
  return [{ text: `The user has ${count} document(s).` }];
}
export async function getDocumentStatus(userId: string): Promise<MetadataFact[]> {
  const docs = await prisma.document.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 20, select: { id: true, fileName: true, status: true } });
  return docs.map((doc) => ({ documentId: doc.id, text: `${doc.fileName}: ${doc.status.toLowerCase()}` }));
}
export async function recentDocuments(userId: string): Promise<MetadataFact[]> {
  return listDocuments(userId);
}
export async function runMetadataQuery(userId: string, intent: MetadataIntent): Promise<MetadataFact[]> {
  switch (intent) {
    case "list_documents": return listDocuments(userId);
    case "count_documents": return countDocuments(userId);
    case "document_status": return getDocumentStatus(userId);
    case "recent_documents": return recentDocuments(userId);
  }
}
