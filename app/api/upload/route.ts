// Force dynamic: this route uses DB or external APIs
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { storageProvider } from "@/lib/storage";

// Allow large video file uploads (up to 60s processing time)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Validate it's a video file
    if (!file.type.startsWith("video/") && !file.name.toLowerCase().endsWith(".mp4")) {
      return NextResponse.json({ success: false, error: "Only video files are allowed" }, { status: 400 });
    }

    // 500MB limit check
    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 500MB." },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileUrl = await storageProvider.uploadFile(
      buffer,
      file.name,
      file.type || "video/mp4"
    );

    return NextResponse.json({
      success: true,
      data: {
        fileUrl,
        filename: file.name,
        size: file.size,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "File upload failed";
    console.error("[Upload API] Error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

