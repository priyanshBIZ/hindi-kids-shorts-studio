import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { youtubeOAuthProvider } from "@/lib/platforms/youtube";

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
          error: "An MP4 video file is required for direct YouTube publishing. Please upload the video in the Video Checkpoint tab.",
        },
        { status: 400 }
      );
    }

    const title = story.metadata?.youtubeTitle || `${story.title} #Shorts`;
    const description =
      story.metadata?.youtubeDescription ||
      `${story.concept}\n\nMoral: ${story.moral}\n\nLike & Subscribe for more Hindi Kids Stories!`;

    const tags = story.metadata?.youtubeTags
      ? story.metadata.youtubeTags.split(",").map((t) => t.trim())
      : ["Hindi Stories", "Kids Shorts", "Moral Stories", "3D Animation"];

    const result = await youtubeOAuthProvider.publishShort({
      storyId: id,
      filePath: video.fileUrl,
      title,
      description,
      tags,
      privacyStatus: "public",
    });

    return NextResponse.json({
      success: true,
      message: "Successfully published to YouTube Shorts!",
      data: result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "YouTube publishing failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
