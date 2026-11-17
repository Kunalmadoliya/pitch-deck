import ImageKit from "@imagekit/nodejs";
import { indexingConfig } from "../config";
import { StorageError } from "../errors";
import { ImageKitStorage } from "./imagekit-storage";
import type { Storage } from "./storage.interface";

export function createStorage(): Storage {
  const { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = indexingConfig;
  if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new StorageError("ImageKit storage is not configured");
  }
  return new ImageKitStorage(new ImageKit({ privateKey: IMAGEKIT_PRIVATE_KEY }), IMAGEKIT_URL_ENDPOINT);
}
