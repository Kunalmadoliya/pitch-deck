import { UnsupportedFileError } from "../errors";
import type { FileKind } from "../types";

export function detectFileKind(mimeType: string): FileKind {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  throw new UnsupportedFileError(`Unsupported MIME type: ${mimeType}`);
}
