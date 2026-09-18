import { put, del } from "@vercel/blob";
import { StorageProvider } from "./types";

/**
 * Vercel Blob Storage Provider
 * Used in production (Vercel) instead of local filesystem.
 * Requires BLOB_READ_WRITE_TOKEN env variable (auto-set by Vercel Blob integration).
 */
export class BlobStorageProvider implements StorageProvider {
  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<string> {
    const sanitizedFilename = `videos/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const blob = await put(sanitizedFilename, file, {
      access: "public",
      contentType: mimeType || "video/mp4",
    });

    return blob.url; // Returns full HTTPS public URL
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      await del(fileUrl);
      return true;
    } catch (err) {
      console.error("[BlobStorage] Delete failed:", err);
      return false;
    }
  }

  getPublicUrl(filename: string): string {
    // Blob URLs are absolute, this is a fallback
    return filename;
  }
}

export const blobStorageProvider = new BlobStorageProvider();
