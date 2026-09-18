import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { metaInstagramProvider } from "@/lib/platforms/meta";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        videos: {
          orderBy: { createdAt: "desc" },
        },
        metadata: true,
      },
    });

    if (!story) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    const video = story.videos.find((v) => v.fileUrl);
    if (!video || !video.fileUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "An MP4 video file is required for Instagram Reels publishing. Please upload the video in the Video Checkpoint tab.",
        },
        { status: 400 }
      );
    }

    const caption = story.metadata?.instagramCaption || `${story.title} ✨ ${story.concept}`;
    const hashtags = story.metadata?.instagramHashtags || "#reelsindia #hindikahaniya #kidsreels";

    const result = await metaInstagramProvider.publishReel({
      storyId: id,
      videoUrl: video.fileUrl,
      caption,
      hashtags,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully published to Instagram Reels!",
      data: result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Instagram Reels publishing failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
