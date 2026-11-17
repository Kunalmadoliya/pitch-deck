import { indexingConfig } from "../config";
import type { FileKind, PageText } from "../types";
import { needsOcr } from "../detection/needs-ocr";
import { extractPdfPageText } from "./extract-pdf-page-text";
import { ocrPage } from "./ocr-page";
import { renderPdfPage } from "./render-pdf-page";

export async function extractPages(
  data: Buffer,
  kind: FileKind,
  pageNumbers: number[],
): Promise<PageText[]> {
  const pages: PageText[] = [];
  for (const pageNumber of pageNumbers) {
    const text = kind === "pdf" ? await extractPdfPageText(data, pageNumber) : "";
    if (kind === "image") {
      const result = await ocrPage(data);
      pages.push({ pageNumber, text: result.text, source: "ocr", ocrConfidence: result.confidence });
      continue;
    }
    if (!needsOcr(text, indexingConfig.OCR_TEXT_THRESHOLD)) {
      pages.push({ pageNumber, text, source: "text-layer" });
      continue;
    }
    const result = await ocrPage(await renderPdfPage(data, pageNumber));
    pages.push({ pageNumber, text: result.text, source: "ocr", ocrConfidence: result.confidence });
  }
  return pages;
}
