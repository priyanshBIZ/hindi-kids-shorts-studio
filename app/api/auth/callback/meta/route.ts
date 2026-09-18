import { NextRequest, NextResponse } from "next/server";
import { metaInstagramProvider } from "@/lib/platforms/meta";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const appUrl = process.env.APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(
      `${appUrl}/settings/instagram?error=${encodeURIComponent(errorDescription || error || "Authorization cancelled")}`
    );
  }

  try {
    await metaInstagramProvider.handleOAuthCallback(code);
    return NextResponse.redirect(`${appUrl}/settings/instagram?success=connected`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to connect Instagram";
    return NextResponse.redirect(`${appUrl}/settings/instagram?error=${encodeURIComponent(errorMsg)}`);
  }
}
