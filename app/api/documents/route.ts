import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest";
import { createStorage } from "@/modules/indexing/storage/create-storage";
import { isInsideUserFolder, sanitizeFileName, validateUpload } from "@/modules/indexing/upload/validate-upload";
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
  let details;
  try {
    details = await createStorage().getFileDetails(input.fileId);
  } catch {
    return Response.json({ error: "Unable to verify uploaded file" }, { status: 403 });
  }
  if (
    details.fileId !== input.fileId ||
    details.filePath !== input.filePath ||
    !isInsideUserFolder(details.filePath, session.user.id) ||
    details.sizeBytes !== input.sizeBytes ||
    details.mimeType !== input.mimeType ||
    !details.isPrivateFile
  ) {
    return Response.json({ error: "Uploaded file ownership or metadata is invalid" }, { status: 403 });
  }
  const document = await prisma.document.create({
    data: {
      storageFileId: details.fileId,
      userId: session.user.id,
      fileName: sanitizeFileName(input.fileName),
      mimeType: details.mimeType,
      sizeBytes: details.sizeBytes,
      storagePath: details.filePath,
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
