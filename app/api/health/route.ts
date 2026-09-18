import { NextResponse } from "next/server";

// Force dynamic: this route hits the DB and should never be statically pre-rendered
export const dynamic = "force-dynamic";
import { geminiAIProvider, geminiTTSProvider } from "@/lib/ai/gemini";
import { youtubeOAuthProvider } from "@/lib/platforms/youtube";
import { metaInstagramProvider, metaFacebookProvider } from "@/lib/platforms/meta";
import { useAPIVideoProvider } from "@/lib/video/useapi";

export async function GET() {
  const geminiStatus = await geminiAIProvider.testConnection();
  const ttsStatus = await geminiTTSProvider.testConnection();
  const youtubeStatus = await youtubeOAuthProvider.getConnectionStatus();
  const igStatus = await metaInstagramProvider.getConnectionStatus();
  const fbStatus = await metaFacebookProvider.getConnectionStatus();

  return NextResponse.json({
    success: true,
    data: {
      gemini: {
        service: "GEMINI",
        name: "Google Gemini AI",
        status: geminiStatus.connected ? "CONNECTED" : "NOT_CONFIGURED",
        model: geminiStatus.model,
        latencyMs: geminiStatus.latencyMs,
        details: geminiStatus.error || "Connected & ready for story generation",
        canTest: true,
      },
      geminiTTS: {
        service: "TTS",
        name: "Google Gemini TTS",
        status: ttsStatus.connected ? "CONNECTED" : "NOT_CONFIGURED",
        model: ttsStatus.model,
        details: ttsStatus.error || "Ready for Hindi voice narration",
        canTest: true,
      },
      flow: {
        service: "FLOW",
        name: "Google Flow / Veo",
        status: "MANUAL",
        details: useAPIVideoProvider.isConfigured() 
          ? "UseAPI configured for automated generation" 
          : "Manual Flow Prompt Checkpoint (Active)",
        canTest: false,
      },
      youtube: {
        service: "YOUTUBE",
        name: "YouTube Shorts API",
        status: youtubeStatus.connected ? "CONNECTED" : "NOT_CONFIGURED",
        details: youtubeStatus.channelTitle 
          ? `Connected: ${youtubeStatus.channelTitle}` 
          : youtubeStatus.error || "Not connected",
        canTest: true,
      },
      instagram: {
        service: "INSTAGRAM",
        name: "Instagram Reels API",
        status: igStatus.connected ? "CONNECTED" : "NOT_CONFIGURED",
        details: igStatus.accountName 
          ? `Connected: ${igStatus.accountName}` 
          : igStatus.error || "Not connected",
        canTest: true,
      },
      facebook: {
        service: "FACEBOOK",
        name: "Facebook Pages API",
        status: fbStatus.connected ? "CONNECTED" : "NOT_CONFIGURED",
        details: fbStatus.details || "Meta OAuth configuration",
        canTest: true,
      },
    },
  });
}
