import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

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
        videos: {
          orderBy: { createdAt: "desc" },
        },
        metadata: true,
        publications: true,
      },
    });

    if (!story) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: story });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch story";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const updated = await prisma.story.update({
      where: { id },
      data: {
        title: body.title,
        concept: body.concept,
        moral: body.moral,
        storyText: body.storyText,
        status: body.status,
      },
      include: {
        scenes: {
          orderBy: { sceneNumber: "asc" },
        },
        videos: true,
        metadata: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update story";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.story.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Story deleted successfully" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete story";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
