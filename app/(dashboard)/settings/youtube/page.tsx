"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Youtube, CheckCircle2, XCircle, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { YouTubeConnectionStatus } from "@/lib/platforms/youtube";

export default function YouTubeSettingsPage() {
  const [status, setStatus] = useState<YouTubeConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/youtube/status");
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect this YouTube Channel?")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/youtube/status", { method: "POST" });
      await fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-500" />
            <span>YouTube Shorts Official Integration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Authenticate your YouTube channel via Google OAuth 2.0 to enable 1-click Shorts publishing.
          </p>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card className="space-y-6 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            <span>Channel Connection Status</span>
          </CardTitle>

          {status?.connected ? (
            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Channel Connected</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 py-1 px-3 text-slate-400">
              <XCircle className="h-3.5 w-3.5" />
              <span>Not Connected</span>
            </Badge>
          )}
        </CardHeader>

        {status?.connected ? (
          <div className="p-5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-lg border border-red-500/30">
                🎬
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm">
                  {status.channelTitle}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {status.channelId}
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={handleDisconnect}
              isLoading={disconnecting}
              className="text-xs"
            >
              Disconnect Channel
            </Button>
          </div>
        ) : (
          <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-4">
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Connect your YouTube channel using official Google OAuth. Antigravity will securely request permissions to upload your generated 9:16 Shorts directly.
            </p>

            <a href="/api/auth/youtube" className="inline-block">
              <Button size="md" variant="primary" className="gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
                <Youtube className="h-4 w-4" />
                <span>Connect YouTube Channel with Google</span>
              </Button>
            </a>
          </div>
        )}

        {/* Credentials Setup Guide */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Google Cloud Console OAuth Setup
          </h4>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <p>1. Go to Google Cloud Console & create an OAuth 2.0 Client ID (Web Application).</p>
            <p>
              2. Add Authorized Redirect URI:{" "}
              <code className="text-amber-400 font-mono">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/api/auth/callback/youtube`
                  : "https://your-domain.vercel.app/api/auth/callback/youtube"}
              </code>
            </p>
            <p>3. Enable <strong>YouTube Data API v3</strong> in your Google Cloud Project.</p>
            <p>4. Add your Client ID & Secret to your environment variables:</p>
            <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono">
              YOUTUBE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com<br/>
              YOUTUBE_CLIENT_SECRET=your_google_client_secret
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
