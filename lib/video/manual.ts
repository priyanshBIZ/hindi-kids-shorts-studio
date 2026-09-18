import { VideoProvider } from "./types";
import { VideoRecord } from "@/types/video";
import { prisma } from "../database/prisma";

export class ManualVideoProvider implements VideoProvider {
  name = "Manual Google Flow";
  isAutomated = false;

  async saveManualVideo(params: {
    storyId: string;
    fileUrl?: string;
    youtubeUrl?: string;
    duration?: number;
  }): Promise<VideoRecord> {
    if (!params.fileUrl && !params.youtubeUrl) {
      throw new Error("Either an MP4 video file or a YouTube Short URL must be provided.");
    }

    // Save or update video record
    const existingVideo = await prisma.video.findFirst({
      where: { storyId: params.storyId },
    });

    let video;
    if (existingVideo) {
      video = await prisma.video.update({
        where: { id: existingVideo.id },
        data: {
          fileUrl: params.fileUrl || existingVideo.fileUrl,
          youtubeUrl: params.youtubeUrl || existingVideo.youtubeUrl,
          duration: params.duration || existingVideo.duration,
          status: "READY",
          provider: "MANUAL",
        },
      });
    } else {
      video = await prisma.video.create({
        data: {
          storyId: params.storyId,
          fileUrl: params.fileUrl || null,
          youtubeUrl: params.youtubeUrl || null,
          duration: params.duration || 30,
          aspectRatio: "9:16",
          status: "READY",
          provider: "MANUAL",
        },
      });
    }

    // Update story status
    const metadata = await prisma.metadata.findUnique({
      where: { storyId: params.storyId },
    });

    const nextStatus = metadata ? "READY_TO_PUBLISH" : "VIDEO_ADDED";

    await prisma.story.update({
      where: { id: params.storyId },
      data: { status: nextStatus },
    });

    return {
      id: video.id,
      storyId: video.storyId,
      fileUrl: video.fileUrl,
      youtubeUrl: video.youtubeUrl,
      duration: video.duration,
      aspectRatio: video.aspectRatio,
      status: video.status as VideoRecord["status"],
      flowCreditsUsed: video.flowCreditsUsed,
      provider: "MANUAL",
      createdAt: video.createdAt,
    };
  }
}

export const manualVideoProvider = new ManualVideoProvider();
