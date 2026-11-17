import type { Storage } from "../storage/storage.interface";

export async function saveUpload(storage: Storage, fileName: string, data: Uint8Array): Promise<string> {
  return storage.save(fileName, data);
}
