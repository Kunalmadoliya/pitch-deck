export interface StoredFileDetails {
  fileId: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  isPrivateFile: boolean;
}

export interface Storage {
  getFileDetails(fileId: string): Promise<StoredFileDetails>;
  read(fileId: string): Promise<Buffer>;
  remove(fileId: string): Promise<void>;
}
