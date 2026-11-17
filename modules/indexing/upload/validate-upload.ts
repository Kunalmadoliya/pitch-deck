import { z } from "zod";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

export const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(allowedMimeTypes),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

export function validateUpload(input: unknown) {
  return uploadSchema.parse(input);
}
