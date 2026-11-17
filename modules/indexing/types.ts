export type FileKind = "pdf" | "image";
export type PageSource = "text-layer" | "ocr";

export interface PageText {
  pageNumber: number;
  text: string;
  source: PageSource;
  ocrConfidence?: number;
}

export interface Chunk {
  pageNumber: number;
  chunkIndex: number;
  text: string;
  source: PageSource;
  ocrConfidence?: number;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: Record<string, string | number>;
}

export interface BatchSummary {
  pages: number;
  chunks: number;
}
