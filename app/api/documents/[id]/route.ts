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
