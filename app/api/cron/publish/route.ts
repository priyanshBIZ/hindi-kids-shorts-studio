import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { youtubeOAuthProvider } from "@/lib/platforms/youtube";
import { storageProvider } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily Automated Publisher Cron Endpoint
 * Scheduled to run daily at 10:00 AM IST (04:30 UTC via vercel.json crons).
 * 
 * Logic:
 * 1. Queries all stories scheduled for today (or past due) that are READY_TO_PUBLISH or VIDEO_ADDED.
 * 2. Uploads the attached video to YouTube via YouTube Data API v3.
 * 3. Once published successfully, automatically DELETES the MP4 video file from Vercel Blob storage
 *    to keep storage usage minimal.
 * 4. Updates story status to PUBLISHED and records the YouTube publication URL.
 */
export async function GET(req: NextRequest) {
  // Verify Cron Secret if set (Vercel Cron sends Authorization header)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized cron request" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find stories that are scheduled for today or past due and ready to publish
    const eligibleStories = await prisma.story.findMany({
      where: {
        status: { in: ["READY_TO_PUBLISH", "VIDEO_ADDED", "PROMPTS_READY"] },
        OR: [
          { scheduledFor: { lte: now } },
          { scheduledFor: null },
        ],
      },
      include: {
        videos: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        metadata: true,
      },
      take: 5, // Batch limit per cron run
    });

    if (eligibleStories.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No scheduled videos pending publication for today at 10:00 AM.",
        publishedCount: 0,
      });
    }

    const results = [];

    for (const story of eligibleStories) {
      const video = story.videos[0];
      if (!video) continue;

      const title = story.metadata?.youtubeTitle || story.title;
      const description = story.metadata?.youtubeDescription || story.concept;
      const tags = story.metadata?.youtubeTags ? story.metadata.youtubeTags.split(",") : ["Shorts", "HindiStories"];

      try {
        let publishedUrl = video.youtubeUrl;
        let publishedVideoId = "";

        // If there's an uploaded MP4 file and YouTube is connected, publish to YouTube
        if (video.fileUrl && youtubeOAuthProvider.isConfigured()) {
          const ytResult = await youtubeOAuthProvider.publishShort({
            storyId: story.id,
            filePath: video.fileUrl,
            title,
            description,
            tags,
            privacyStatus: "public",
          });
          publishedUrl = ytResult.youtubeUrl;
          publishedVideoId = ytResult.videoId;
        }

        // AUTO CLEANUP: Once published, delete the MP4 file from Vercel Blob storage!
        let blobDeleted = false;
        if (video.fileUrl) {
          blobDeleted = await storageProvider.deleteFile(video.fileUrl);
          
          // Clear fileUrl from DB to reclaim storage space
          await prisma.video.update({
            where: { id: video.id },
            data: { fileUrl: null },
          });
        }

        // Mark story as PUBLISHED
        await prisma.story.update({
          where: { id: story.id },
          data: { status: "PUBLISHED" },
        });

        results.push({
          storyId: story.id,
          title: story.title,
          youtubeUrl: publishedUrl,
          blobDeleted,
          status: "SUCCESS",
        });
      } catch (pubErr: unknown) {
        const errorMsg = pubErr instanceof Error ? pubErr.message : "Publish failed";
        console.error(`[Cron Publish] Failed for story ${story.id}:`, errorMsg);
        results.push({
          storyId: story.id,
          title: story.title,
          error: errorMsg,
          status: "FAILED",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Daily 10:00 AM Publisher completed. Processed ${results.length} stories.`,
      results,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Cron execution failed";
    console.error("[Cron Publish] Error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
