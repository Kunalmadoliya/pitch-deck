import { indexingConfig } from "../config";
import { needsOcr } from "../detection/needs-ocr";
import type { FileKind, PageText } from "../types";
import { ocrPage } from "./ocr-page";
import type { OpenPdf } from "./open-pdf";

export interface ExtractedPage {
  page: PageText;
  /** Time spent on OCR (render + recognize) for this page, 0 if the text layer was enough. */
  ocrMs: number;
}

/**
 * Get the text for one page.
 * PDF page with a real text layer -> use it (fast).
 * Scanned PDF page or image       -> OCR it with the shared Tesseract pool.
 */
export async function extractPage(
  input: { kind: FileKind; data: Buffer; pdf: OpenPdf | null },
  pageNumber: number,
): Promise<ExtractedPage> {
  if (input.kind === "image") {
    const startedAt = Date.now();
    const result = await ocrPage(input.data);
    return {
      page: { pageNumber, text: result.text, source: "ocr", ocrConfidence: result.confidence },
      ocrMs: Date.now() - startedAt,
    };
  }

  if (!input.pdf) throw new Error("PDF was not opened");
  const text = await input.pdf.readText(pageNumber);
  if (!needsOcr(text, indexingConfig.OCR_TEXT_THRESHOLD)) {
    return { page: { pageNumber, text, source: "text-layer" }, ocrMs: 0 };
  }

  const startedAt = Date.now();
  const result = await ocrPage(await input.pdf.renderImage(pageNumber));
  return {
    page: { pageNumber, text: result.text, source: "ocr", ocrConfidence: result.confidence },
    ocrMs: Date.now() - startedAt,
  };
}
