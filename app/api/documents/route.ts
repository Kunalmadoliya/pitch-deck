import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest";
import { validateUpload } from "@/modules/indexing/upload/validate-upload";
import { isInsideUserFolder } from "@/modules/indexing/upload/validate-upload";
import { DocumentStatus, IndexingStage } from "@/lib/generated/prisma/client";

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let input: ReturnType<typeof validateUpload>;
  try {
    input = validateUpload(await request.json());
  } catch {
    return Response.json({ error: "Invalid document registration" }, { status: 400 });
  }
  if (!isInsideUserFolder(input.filePath, session.user.id)) {
    return Response.json({ error: "File path is outside the user folder" }, { status: 403 });
  }
  const existing = await prisma.document.findUnique({ where: { storageFileId: input.fileId } });
  if (existing) {
    if (existing.userId !== session.user.id) {
      return Response.json({ error: "File is already registered" }, { status: 409 });
    }
    return Response.json(
      { documentId: existing.id, status: existing.status, stage: existing.stage },
      { status: 202 },
    );
  }
  const document = await prisma.document.create({
    data: {
      storageFileId: input.fileId,
      userId: session.user.id,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storagePath: input.filePath,
      status: DocumentStatus.UPLOADED,
      stage: IndexingStage.QUEUED,
    },
    select: { id: true, status: true, stage: true },
  });
  await inngest.send({ name: "document/uploaded", data: { documentId: document.id, userId: session.user.id } });
  return Response.json({ documentId: document.id }, { status: 202 });
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
