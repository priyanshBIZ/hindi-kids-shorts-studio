import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Vercel Blob client-upload handler.
 * The browser uploads directly to Vercel Blob (no 4.5MB server limit).
 * This route only handles the token generation & completion callback.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file type - only allow videos
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
        // Called by Vercel after upload is done
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
