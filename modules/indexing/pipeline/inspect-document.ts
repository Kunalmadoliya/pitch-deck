import type { Storage } from "../storage/storage.interface";
import { detectFileKind } from "../detection/detect-file-kind";
import { getPdfPageCount } from "../extraction/get-pdf-page-count";
import type { FileKind } from "../types";
import { InvalidUploadError } from "../errors";
import { isInsideUserFolder } from "../upload/validate-upload";

export async function inspectDocument(
  storage: Storage,
  document: { storageFileId: string; storagePath: string; mimeType: string; sizeBytes: number; userId: string },
): Promise<{ pageCount: number; kind: FileKind }> {
  const details = await storage.getFileDetails(document.storageFileId);
  if (
    details.fileId !== document.storageFileId ||
    details.filePath !== document.storagePath ||
    details.mimeType !== document.mimeType ||
    details.sizeBytes !== document.sizeBytes ||
    !details.isPrivateFile ||
    !isInsideUserFolder(details.filePath, document.userId)
  ) {
    throw new InvalidUploadError();
  }
  const kind = detectFileKind(details.mimeType);
  const data = await storage.read(document.storageFileId);
  const pageCount = kind === "pdf" ? await getPdfPageCount(data) : 1;
  return { pageCount, kind };
}
