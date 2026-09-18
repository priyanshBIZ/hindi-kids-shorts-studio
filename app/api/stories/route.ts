// Force dynamic: this route uses DB or external APIs
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { generateDailyStory } from "@/lib/ai/story-generator";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where = status && status !== "ALL" ? { status } : {};

    const stories = await prisma.story.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        scenes: {
          orderBy: { sceneNumber: "asc" },
        },
        videos: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        metadata: true,
        publications: true,
      },
    });

    return NextResponse.json({ success: true, data: stories });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch stories";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const story = await generateDailyStory(body);

    return NextResponse.json({
      success: true,
      message: "Story generated successfully!",
      data: story,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Story generation failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

