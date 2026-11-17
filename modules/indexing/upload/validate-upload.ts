import { z } from "zod";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES, UPLOAD_FOLDER_PREFIX } from "../config";

export const uploadSchema = z.object({
  fileId: z.string().trim().min(1).max(255),
  filePath: z.string().trim().min(1).max(1024),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

export function validateUpload(input: unknown) {
  return uploadSchema.parse(input);
}

export function isInsideUserFolder(filePath: string, userId: string): boolean {
  const prefix = `${UPLOAD_FOLDER_PREFIX}/${userId}/`;
  return (
    filePath.startsWith(prefix) &&
    !filePath.split("/").some((segment) => segment === ".." || segment.toLowerCase() === "%2e%2e")
  );
}

export function sanitizeFileName(name: string): string {
  const sanitized = name
    .trim()
    .replace(/[\\/]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/^\.+/, "")
    .slice(0, 200)
    .trim();
  return sanitized || "document";
}
