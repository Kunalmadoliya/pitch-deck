export class IndexingError extends Error {
  constructor(message: string, public readonly code: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "IndexingError";
  }
}

export class UnsupportedFileError extends IndexingError {
  constructor(message = "Unsupported document type") {
    super(message, "UNSUPPORTED_FILE");
  }
}

export class OcrError extends IndexingError {
  constructor(message = "OCR processing failed", options?: ErrorOptions) {
    super(message, "OCR_FAILED", options);
  }
}

export class InvalidUploadError extends IndexingError {
  constructor(message = "InvalidUploadError: upload metadata mismatch") {
    super(message, "INVALID_UPLOAD");
  }
}

export class StorageError extends IndexingError {
  constructor(message = "ImageKit storage operation failed", options?: ErrorOptions) {
    super(message, "STORAGE_FAILED", options);
  }
}

export function sanitizeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : "Indexing failed";
  return message
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/[?&][^\s]+/g, "")
    .slice(0, 500);
}
