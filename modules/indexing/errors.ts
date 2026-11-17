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

export class EmbeddingError extends IndexingError {
  constructor(message = "Embedding generation failed", options?: ErrorOptions) {
    super(message, "EMBEDDING_FAILED", options);
  }
}
