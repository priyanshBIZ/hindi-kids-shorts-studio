import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { localStorageProvider } from "@/lib/storage/local";

export const dynamic = "force-dynamic";

/**
 * Upload Route
 * Supports both Vercel Blob client upload (production)
 * and direct FormData upload fallback (local dev or when Blob token is missing).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const contentType = request.headers.get("content-type") || "";

  // CASE 1: Standard multipart/form-data upload (fallback / local dev)
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileUrl = await localStorageProvider.uploadFile(
        buffer,
        file.name,
        file.type || "video/mp4"
      );

      return NextResponse.json({
        success: true,
        url: fileUrl,
        data: { fileUrl, filename: file.name, size: file.size },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Local upload failed";
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
  }

  // CASE 2: Vercel Blob client-upload token generation
  try {
    const body = (await request.json()) as HandleUploadBody;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            "BLOB_READ_WRITE_TOKEN environment variable is missing on Vercel. Please add BLOB_READ_WRITE_TOKEN in Vercel Settings -> Environment Variables.",
        },
        { status: 400 }
      );
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async (pathname) => {
        const lower = pathname.toLowerCase();
        const isVideo =
          lower.endsWith(".mp4") ||
          lower.endsWith(".mov") ||
          lower.endsWith(".webm");

        if (!isVideo) {
          throw new Error("Only video files (MP4, MOV, WebM) are allowed.");
        }

        return {
          allowedContentTypes: ["video/mp4", "video/quicktime", "video/webm", "video/*"],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[Blob Upload] Completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Upload failed";
    console.error("[Blob Upload] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
