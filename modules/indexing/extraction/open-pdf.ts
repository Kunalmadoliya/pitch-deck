import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDF_RENDER_SCALE } from "../config";

export interface OpenPdf {
  pageCount: number;
  /** Text from the PDF's own text layer (empty for scanned pages). */
  readText(pageNumber: number): Promise<string>;
  /** Draw the page as an image. Defaults to a sharp PNG for OCR; previews ask for a smaller JPEG. */
  renderImage(pageNumber: number, options?: { scale?: number; format?: "png" | "jpeg"; quality?: number }): Promise<Buffer>;
  close(): Promise<void>;
}

/** Open (parse) a PDF once, then read as many pages from it as needed. */
export async function openPdf(data: Buffer): Promise<OpenPdf> {
  // new Uint8Array(...) copies, so pdf.js can never detach the cached buffer.
  const loadingTask = getDocument({ data: new Uint8Array(data) });
  const document = await loadingTask.promise;

  return {
    pageCount: document.numPages,

    async readText(pageNumber) {
      const page = await document.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        return content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .trim();
      } finally {
        page.cleanup();
      }
    },

    async renderImage(pageNumber, options = {}) {
      const page = await document.getPage(pageNumber);
      try {
        const viewport = page.getViewport({ scale: options.scale ?? PDF_RENDER_SCALE });
        const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
        await page.render({
          canvasContext: canvas.getContext("2d") as never,
          canvas: canvas as never,
          viewport,
        }).promise;
        // Async encode runs off the main thread, so other pages keep moving meanwhile.
        if (options.format === "jpeg") return await canvas.encode("jpeg", options.quality ?? 80);
        return await canvas.encode("png");
      } finally {
        page.cleanup();
      }
    },

    async close() {
      await loadingTask.destroy();
    },
  };
}
