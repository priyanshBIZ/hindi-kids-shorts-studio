// Force dynamic: this route uses DB or external APIs
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { storageProvider } from "@/lib/storage";
import { prisma } from "@/lib/database/prisma";

/**
 * DELETE /api/upload/delete
 * Deletes a previously uploaded video file from storage (Vercel Blob or local)
 * and clears the fileUrl from the story's video record.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl, storyId } = body;

    if (!fileUrl) {
      return NextResponse.json({ success: false, error: "fileUrl is required" }, { status: 400 });
    }

    // Delete from storage (Vercel Blob in prod, local filesystem in dev)
    const deleted = await storageProvider.deleteFile(fileUrl);

    // Clear the fileUrl from the video DB record if storyId is provided
    if (storyId) {
      const existingVideo = await prisma.video.findFirst({
        where: { storyId },
      });

      if (existingVideo) {
        const updatedVideo = await prisma.video.update({
          where: { id: existingVideo.id },
          data: {
            fileUrl: null,
            // Only reset status if there's no YouTube URL either
            status: existingVideo.youtubeUrl ? "READY" : "PENDING",
          },
        });

        // Reset story status if video is now fully empty
        if (!updatedVideo.fileUrl && !updatedVideo.youtubeUrl) {
          await prisma.story.update({
            where: { id: storyId },
            data: { status: "PROMPTS_READY" },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      deleted,
      message: deleted ? "Video file deleted successfully." : "File not found but record cleared.",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Delete failed";
    console.error("[Delete API] Error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

