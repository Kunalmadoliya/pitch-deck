export interface Storage {
  save(fileName: string, data: Uint8Array): Promise<string>;
  read(storagePath: string): Promise<Buffer>;
  remove(storagePath: string): Promise<void>;
}
