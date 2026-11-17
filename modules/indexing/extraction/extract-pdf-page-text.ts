import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractPdfPageText(data: Buffer, pageNumber: number): Promise<string> {
  const document = await getDocument({ data: new Uint8Array(data) }).promise;
  const page = await document.getPage(pageNumber);
  const content = await page.getTextContent();
  return content.items
    .map((item) => ("str" in item ? item.str : ""))
    .join(" ")
    .trim();
}
