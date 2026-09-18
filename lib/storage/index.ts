/**
 * Smart Storage Provider
 * - Local development: uses filesystem (public/uploads/)
 * - Production (Vercel): uses Vercel Blob Storage
 *
 * Automatically switches based on NODE_ENV or presence of BLOB_READ_WRITE_TOKEN.
 */

import { StorageProvider } from "./types";

function getStorageProvider(): StorageProvider {
  const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (isVercel) {
    // Dynamic import to avoid loading blob SDK when not needed
    const { blobStorageProvider } = require("./blob");
    return blobStorageProvider;
  } else {
    const { localStorageProvider } = require("./local");
    return localStorageProvider;
  }
}

export const storageProvider: StorageProvider = getStorageProvider();
