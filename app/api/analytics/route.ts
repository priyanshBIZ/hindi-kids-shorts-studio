// Force dynamic: this route uses DB or external APIs
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function GET() {
  try {
    const totalStories = await prisma.story.count();
    const readyToPublish = await prisma.story.count({ where: { status: "READY_TO_PUBLISH" } });
    const published = await prisma.story.count({ where: { status: "PUBLISHED" } });
    const videosAdded = await prisma.video.count();

    const usages = await prisma.apiUsage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const totalTokens = usages.reduce((acc, curr) => acc + (curr.tokensUsed || 0), 0);
    const totalCost = usages.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalStories,
          readyToPublish,
          published,
          videosAdded,
          totalTokens,
          totalCost: Number(totalCost.toFixed(4)),
        },
        recentLogs: usages.slice(0, 20),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch analytics";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

