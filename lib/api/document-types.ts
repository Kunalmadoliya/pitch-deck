export type DocumentStatus = "UPLOADED" | "PROCESSING" | "INDEXED" | "FAILED";

export type UploadPhase =
  | "idle"
  | "validating"
  | "authorizing"
  | "uploading"
  | "registering"
  | "done";

export type IndexingStage =
  | "QUEUED"
  | "INSPECTING"
  | "EXTRACTING"
  | "CHUNKING"
  | "EMBEDDING"
  | "UPSERTING"
  | "DONE";

export interface DocumentItem {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  stage: IndexingStage;
  pageCount: number | null;
  pagesProcessed: number;
  chunkCount: number;
  errorMessage: string | null;
  indexedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadAuthResponse {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
}

export interface UploadDocumentPayload {
  fileId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_UPLOAD_MB = 50;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const documentKeys = {
  all: ["documents"] as const,
  list: () => [...documentKeys.all, "list"] as const,
  detail: (id: string) => [...documentKeys.all, "detail", id] as const,
};

export function statusLabel(status: DocumentStatus): string {
  switch (status) {
    case "UPLOADED":
      return "Uploaded";
    case "PROCESSING":
      return "Processing";
    case "INDEXED":
      return "Indexed";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

export function stageLabel(stage: IndexingStage): string {
  switch (stage) {
    case "QUEUED":
      return "Queued in pipeline";
    case "INSPECTING":
      return "Inspecting document";
    case "EXTRACTING":
      return "Reading pages";
    case "CHUNKING":
      return "Segmenting clauses";
    case "EMBEDDING":
      return "Understanding content";
    case "UPSERTING":
      return "Saving to vector index";
    case "DONE":
      return "Ready for queries";
    default:
      return stage;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return `"${file.name}" has an unsupported format. Only PDF, JPEG, PNG, and WEBP are allowed.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `"${file.name}" exceeds the maximum upload limit of ${MAX_UPLOAD_MB} MB.`;
  }
  if (file.size === 0) {
    return `"${file.name}" is an empty file.`;
  }
  return null;
}
