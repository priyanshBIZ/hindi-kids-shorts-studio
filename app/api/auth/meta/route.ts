import { NextResponse } from "next/server";
import { metaInstagramProvider } from "@/lib/platforms/meta";

export async function GET() {
  if (!metaInstagramProvider.isConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "META_APP_ID and META_APP_SECRET are not configured in .env",
      },
      { status: 400 }
    );
  }

  const authUrl = metaInstagramProvider.getAuthUrl();
  return NextResponse.redirect(authUrl);
}
