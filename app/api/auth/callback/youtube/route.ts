import { NextRequest, NextResponse } from "next/server";
import { youtubeOAuthProvider } from "@/lib/platforms/youtube";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const appUrl = host ? `${proto}://${host}` : (process.env.APP_URL || "http://localhost:3000");

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/settings/youtube?error=${encodeURIComponent(error || "Authorization cancelled")}`);
  }

  try {
    await youtubeOAuthProvider.handleOAuthCallback(code);
    return NextResponse.redirect(`${appUrl}/settings/youtube?success=connected`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to connect YouTube";
    return NextResponse.redirect(`${appUrl}/settings/youtube?error=${encodeURIComponent(errorMsg)}`);
  }
}
