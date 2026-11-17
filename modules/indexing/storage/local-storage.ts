import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import type { Storage } from "./storage.interface";

export class LocalStorage implements Storage {
  private readonly root: string;

  constructor(root: string) {
    this.root = resolve(root);
  }

  async save(fileName: string, data: Uint8Array): Promise<string> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = join(this.root, `${Date.now()}-${safeName}`);
    await mkdir(this.root, { recursive: true });
    await writeFile(storagePath, data);
    return storagePath;
  }

  async read(storagePath: string): Promise<Buffer> {
    this.assertInsideRoot(storagePath);
    return readFile(storagePath);
  }

  async remove(storagePath: string): Promise<void> {
    this.assertInsideRoot(storagePath);
    await rm(storagePath, { force: true });
  }

  private assertInsideRoot(storagePath: string): void {
    if (!isAbsolute(storagePath) || relative(this.root, resolve(storagePath)).startsWith("..")) {
      throw new Error("Storage path is outside the configured upload directory");
    }
  }
}
