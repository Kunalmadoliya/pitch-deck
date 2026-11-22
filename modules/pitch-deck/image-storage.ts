import ImageKit, { toFile } from "@imagekit/nodejs";
import { indexingConfig } from "@/modules/indexing/config";

let client: ImageKit | undefined;

function getClient(): ImageKit {
  const { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = indexingConfig;
  if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) throw new Error("ImageKit storage is not configured");
  client ??= new ImageKit({ privateKey: IMAGEKIT_PRIVATE_KEY });
  return client;
}

const EXTENSIONS: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/**
 * Uploads a generated slide image (Buffer) to ImageKit and returns its public URL.
 * Slide images are AI-generated (no user documents), so they are public so <img> can load them directly.
 */
export async function uploadSlideImage(input: {
  buffer: Buffer;
  mimeType: string;
  userId: string;
  deckId: string;
  slideId: string;
}): Promise<{ url: string; fileId: string }> {
  const extension = EXTENSIONS[input.mimeType] ?? "png";
  const fileName = `slide-${input.slideId}.${extension}`;

  const uploaded = await getClient().files.upload({
    file: await toFile(input.buffer, fileName, { type: input.mimeType }),
    fileName,
    folder: `/deck-images/${input.userId}/${input.deckId}`,
    useUniqueFileName: true,
    isPrivateFile: false,
    tags: ["pitch-deck", "ai-generated"],
  });

  if (!uploaded.url || !uploaded.fileId) throw new Error("ImageKit upload returned no URL");
  return { url: uploaded.url, fileId: uploaded.fileId };
}

/** Removes uploaded slide images (used when a deck is deleted). Missing files are ignored. */
export async function deleteSlideImages(fileIds: string[]): Promise<void> {
  if (fileIds.length === 0) return;
  const results = await Promise.allSettled(fileIds.map((id) => getClient().files.delete(id)));
  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) console.warn(JSON.stringify({ source: "deck-image", event: "delete-failed", failed }));
}
