import { getUploadAuthParams } from "@imagekit/next/server";
import { IMAGEKIT_UPLOAD_AUTH_EXPIRY_SECONDS, indexingConfig } from "../config";
import { StorageError } from "../errors";

export function getImageKitUploadAuthParams(): {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
} {
  const { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY } = indexingConfig;
  if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_PUBLIC_KEY) {
    throw new StorageError("ImageKit upload authentication is not configured");
  }
  const expire = Math.floor(Date.now() / 1000) + IMAGEKIT_UPLOAD_AUTH_EXPIRY_SECONDS;
  const authParams = getUploadAuthParams({
    privateKey: IMAGEKIT_PRIVATE_KEY,
    publicKey: IMAGEKIT_PUBLIC_KEY,
    expire,
  });
  return { ...authParams, publicKey: IMAGEKIT_PUBLIC_KEY };
}
