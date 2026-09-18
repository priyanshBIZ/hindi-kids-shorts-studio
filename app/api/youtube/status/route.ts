// Force dynamic: this route uses DB or external APIs
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { youtubeOAuthProvider } from "@/lib/platforms/youtube";

export async function GET() {
  try {
    const status = await youtubeOAuthProvider.getConnectionStatus();
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch YouTube status";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST() {
  try {
    const success = await youtubeOAuthProvider.disconnect();
    return NextResponse.json({
      success,
      message: "YouTube account disconnected successfully",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to disconnect YouTube";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

