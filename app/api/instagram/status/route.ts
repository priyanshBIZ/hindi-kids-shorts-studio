// Force dynamic: this route uses DB or external APIs
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { metaInstagramProvider } from "@/lib/platforms/meta";

export async function GET() {
  try {
    const status = await metaInstagramProvider.getConnectionStatus();
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch Instagram status";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST() {
  try {
    const success = await metaInstagramProvider.disconnect();
    return NextResponse.json({
      success,
      message: "Instagram account disconnected successfully",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to disconnect Instagram";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

