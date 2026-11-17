import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function getPdfPageCount(data: Buffer): Promise<number> {
  const document = await getDocument({ data: new Uint8Array(data) }).promise;
  return document.numPages;
}
