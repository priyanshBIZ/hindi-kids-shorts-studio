import { NextRequest, NextResponse } from "next/server";
import { youtubeOAuthProvider } from "@/lib/platforms/youtube";

export async function GET(req: NextRequest) {
  if (!youtubeOAuthProvider.isConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET are not configured in .env",
      },
      { status: 400 }
    );
  }

  const authUrl = youtubeOAuthProvider.getAuthUrl(req);
  return NextResponse.redirect(authUrl);
}
