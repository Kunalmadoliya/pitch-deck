import type { Storage } from "../storage/storage.interface";
import { detectFileKind } from "../detection/detect-file-kind";
import { openPdf } from "../extraction/open-pdf";
import type { FileKind } from "../types";
import { InvalidUploadError } from "../errors";
import { isInsideUserFolder } from "../upload/validate-upload";
import { detectMimeFromBytes } from "../detection/detect-mime-from-bytes";
import { readFileCached } from "../storage/read-file-cached";

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
  // This download is cached, so the page batches that follow reuse it instead of downloading again.
  const data = await readFileCached(storage, document.storageFileId);
  if (detectMimeFromBytes(data) !== details.mimeType) {
    throw new InvalidUploadError("InvalidUploadError: file content does not match metadata");
  }
  if (kind !== "pdf") return { pageCount: 1, kind };
  const pdf = await openPdf(data);
  try {
    return { pageCount: pdf.pageCount, kind };
  } finally {
    await pdf.close();
  }
}
