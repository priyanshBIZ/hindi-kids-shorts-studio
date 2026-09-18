import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { buildFlowPromptPackage } from "@/lib/ai/prompt-generator";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        scenes: {
          orderBy: { sceneNumber: "asc" },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    const flowPackage = buildFlowPromptPackage({
      title: story.title,
      durationSeconds: story.durationSeconds,
      scenes: story.scenes.map((s) => ({
        sceneNumber: s.sceneNumber,
        duration: s.duration,
        visualDescription: s.visualDescription,
        videoPrompt: s.videoPrompt,
        narration: s.narration,
      })),
    });

    return NextResponse.json({ success: true, data: flowPackage });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate prompt package";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
