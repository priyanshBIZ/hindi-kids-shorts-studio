export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateAndSaveMetadata } from "@/lib/ai/metadata-generator";
import { prisma } from "@/lib/database/prisma";
import { MetadataSchema } from "@/lib/validation/metadata.schema";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const metadata = await generateAndSaveMetadata(id);

    return NextResponse.json({
      success: true,
      message: "Metadata generated successfully!",
      data: metadata,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate metadata";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = MetadataSchema.parse(body);

    const saved = await prisma.metadata.upsert({
      where: { storyId: id },
      create: {
        storyId: id,
        ...validated,
      },
      update: {
        ...validated,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Metadata updated successfully!",
      data: saved,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update metadata";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
