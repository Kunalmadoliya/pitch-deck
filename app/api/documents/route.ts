import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest";
import { indexingConfig } from "@/modules/indexing/config";
import { saveUpload } from "@/modules/indexing/upload/save-upload";
import { validateUpload } from "@/modules/indexing/upload/validate-upload";
import { LocalStorage } from "@/modules/indexing/storage/local-storage";
import { DocumentStatus, IndexingStage } from "@/lib/generated/prisma/client";

const storage = new LocalStorage(indexingConfig.UPLOAD_DIR);

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "A file is required" }, { status: 400 });

  let input;
  try {
    input = validateUpload({ fileName: file.name, mimeType: file.type, sizeBytes: file.size });
  } catch {
    return Response.json({ error: "Invalid file type or size" }, { status: 400 });
  }

  const storagePath = await saveUpload(storage, input.fileName, new Uint8Array(await file.arrayBuffer()));
  const document = await prisma.document.create({
    data: {
      userId: session.user.id,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storagePath,
      status: DocumentStatus.UPLOADED,
      stage: IndexingStage.QUEUED,
    },
    select: { id: true, status: true, stage: true },
  });
  await inngest.send({ name: "document/uploaded", data: { documentId: document.id, userId: session.user.id } });
  return Response.json(document, { status: 202 });
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
