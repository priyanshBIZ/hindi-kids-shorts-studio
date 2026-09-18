export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { manualVideoProvider } from "@/lib/video/manual";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const video = await manualVideoProvider.saveManualVideo({
      storyId: id,
      fileUrl: body.fileUrl,
      youtubeUrl: body.youtubeUrl,
      duration: body.duration,
    });

    return NextResponse.json({
      success: true,
      message: "Video recorded successfully!",
      data: video,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to record video";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
