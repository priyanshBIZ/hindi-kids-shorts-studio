import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { storageProvider } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/storage/cleanup
 * Scans all videos in the database that are either attached to PUBLISHED stories
 * or have orphaned fileUrls, deletes them from Vercel Blob storage, and clears the fileUrl.
 *
 * This allows 1-click manual cleanup of Vercel Blob storage whenever 7-day batches finish publishing.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const deleteAll = body.deleteAll === true; // If true, deletes ALL uploaded files even if unpublished

    const whereCondition = deleteAll
      ? { fileUrl: { not: null } }
      : {
          fileUrl: { not: null },
          story: { status: "PUBLISHED" },
        };

    const videosWithFiles = await prisma.video.findMany({
      where: whereCondition,
      include: {
        story: {
          select: { title: true, status: true },
        },
      },
    });

    if (videosWithFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Storage is already clean! No published video files found in Vercel Blob storage.",
        deletedCount: 0,
      });
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const video of videosWithFiles) {
      if (!video.fileUrl) continue;

      try {
        const deleted = await storageProvider.deleteFile(video.fileUrl);
        if (deleted) {
          deletedCount++;
        }

        // Clear the fileUrl from DB so storage is tracked as empty
        await prisma.video.update({
          where: { id: video.id },
          data: { fileUrl: null },
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Delete failed";
        errors.push(`Video ${video.id}: ${errorMsg}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up Vercel Blob storage! Deleted ${deletedCount} video file(s).`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Storage cleanup failed";
    console.error("[Storage Cleanup] Error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * GET /api/storage/cleanup
 * Returns storage usage stats (how many files are currently stored in Vercel Blob/local).
 */
export async function GET() {
  try {
    const totalFilesStored = await prisma.video.count({
      where: { fileUrl: { not: null } },
    });

    const publishedFilesStored = await prisma.video.count({
      where: {
        fileUrl: { not: null },
        story: { status: "PUBLISHED" },
      },
    });

    const pendingFilesStored = totalFilesStored - publishedFilesStored;

    return NextResponse.json({
      success: true,
      data: {
        totalFilesStored,
        publishedFilesStored,
        pendingFilesStored,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch storage stats";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
