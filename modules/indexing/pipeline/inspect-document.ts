import type { Storage } from "../storage/storage.interface";
import { detectFileKind } from "../detection/detect-file-kind";
import { getPdfPageCount } from "../extraction/get-pdf-page-count";
import type { FileKind } from "../types";

export async function inspectDocument(
  storage: Storage,
  document: { storagePath: string; mimeType: string },
): Promise<{ pageCount: number; kind: FileKind }> {
  const kind = detectFileKind(document.mimeType);
  const pageCount = kind === "pdf" ? await getPdfPageCount(await storage.read(document.storagePath)) : 1;
  return { pageCount, kind };
}
