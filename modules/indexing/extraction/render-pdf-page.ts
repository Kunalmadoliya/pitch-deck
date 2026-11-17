import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function renderPdfPage(data: Buffer, pageNumber: number): Promise<Buffer> {
  const document = await getDocument({ data: new Uint8Array(data) }).promise;
  const page = await document.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext("2d");
  await page.render({
    canvasContext: context as never,
    canvas: canvas as never,
    viewport,
  }).promise;
  return canvas.toBuffer("image/png");
}
