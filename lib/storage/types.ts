export interface StorageProvider {
  uploadFile(file: Buffer, filename: string, mimeType: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
  getPublicUrl(filename: string): string;
}
