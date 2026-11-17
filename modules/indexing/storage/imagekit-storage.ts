import ImageKit, { NotFoundError } from "@imagekit/nodejs";
import { IMAGEKIT_SIGNED_URL_EXPIRY_SECONDS } from "../config";
import { StorageError } from "../errors";
import type { Storage, StoredFileDetails } from "./storage.interface";

export class ImageKitStorage implements Storage {
  constructor(
    private readonly client: ImageKit,
    private readonly urlEndpoint: string,
  ) {}

  async getFileDetails(fileId: string): Promise<StoredFileDetails> {
    try {
      const file = await this.client.files.get(fileId);
      if (!file.fileId || !file.filePath || !file.mime || file.size === undefined || file.isPrivateFile === undefined) {
        throw new StorageError("ImageKit returned incomplete file metadata");
      }
      return {
        fileId: file.fileId,
        filePath: file.filePath,
        mimeType: file.mime,
        sizeBytes: file.size,
        isPrivateFile: file.isPrivateFile,
      };
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError("Unable to read ImageKit file metadata", { cause: error });
    }
  }

  async read(fileId: string): Promise<Buffer> {
    try {
      const file = await this.getFileDetails(fileId);
      const signedUrl = this.client.helper.buildSrc({
        urlEndpoint: this.urlEndpoint,
        src: file.filePath,
        signed: true,
        expiresIn: IMAGEKIT_SIGNED_URL_EXPIRY_SECONDS,
      });
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error(`ImageKit download returned ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError("Unable to download ImageKit file", { cause: error });
    }
  }

  async remove(fileId: string): Promise<void> {
    try {
      await this.client.files.delete(fileId);
    } catch (error) {
      if (error instanceof NotFoundError || (typeof error === "object" && error !== null && "status" in error && error.status === 404)) {
        return;
      }
      throw new StorageError("Unable to delete ImageKit file", { cause: error });
    }
  }
}
