import { createCanvas, loadImage } from "@napi-rs/canvas";
import { openPdf } from "../extraction/open-pdf";
import { readFileCached } from "../storage/read-file-cached";
import type { Storage } from "../storage/storage.interface";

/** Preview images are small: about 800px wide, which is sharp on retina at popover size. */
const PREVIEW_PDF_SCALE = 1.3;
const PREVIEW_MAX_WIDTH = 900;
const PREVIEW_JPEG_QUALITY = 78;
const MAX_CACHED_PREVIEWS = 60;

// Rendered previews kept in memory, so hovering the same source again is instant.
const globalForPreviews = globalThis as unknown as { __pagePreviewCache?: Map<string, Promise<Buffer>> };
const previews = (globalForPreviews.__pagePreviewCache ??= new Map<string, Promise<Buffer>>());

async function render(
  storage: Storage,
  document: { storageFileId: string; mimeType: string },
  pageNumber: number,
): Promise<Buffer> {
  const data = await readFileCached(storage, document.storageFileId);

  if (document.mimeType === "application/pdf") {
    const pdf = await openPdf(data);
    try {
      return await pdf.renderImage(pageNumber, { scale: PREVIEW_PDF_SCALE, format: "jpeg", quality: PREVIEW_JPEG_QUALITY });
    } finally {
      await pdf.close();
    }
  }

  // Uploaded image: shrink it so a 20MB photo doesn't get sent to the browser on hover.
  const image = await loadImage(data);
  const scale = Math.min(1, PREVIEW_MAX_WIDTH / image.width);
  const canvas = createCanvas(Math.round(image.width * scale), Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.encode("jpeg", PREVIEW_JPEG_QUALITY);
}

/** A small JPEG of one page of a document, for the hover preview on citations. */
export function getPagePreview(
  storage: Storage,
  document: { id: string; storageFileId: string; mimeType: string },
  pageNumber: number,
): Promise<Buffer> {
  const key = `${document.id}:${pageNumber}`;
  const hit = previews.get(key);
  if (hit) {
    // Move to the back so the most recently used previews survive the longest.
    previews.delete(key);
    previews.set(key, hit);
    return hit;
  }

  const image = render(storage, document, pageNumber);
  previews.set(key, image);
  image.catch(() => previews.delete(key));
  while (previews.size > MAX_CACHED_PREVIEWS) {
    const oldest = previews.keys().next().value;
    if (oldest === undefined) break;
    previews.delete(oldest);
  }
  return image;
}

/** Drop a document's previews, e.g. when it is deleted. */
export function evictPagePreviews(documentId: string): void {
  for (const key of previews.keys()) {
    if (key.startsWith(`${documentId}:`)) previews.delete(key);
  }
}
