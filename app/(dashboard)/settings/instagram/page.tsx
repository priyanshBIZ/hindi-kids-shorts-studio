"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Instagram, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetaConnectionStatus } from "@/lib/platforms/meta";

export default function InstagramSettingsPage() {
  const [status, setStatus] = useState<MetaConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/instagram/status");
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
    if (!confirm("Are you sure you want to disconnect this Instagram account?")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/instagram/status", { method: "POST" });
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
            <Instagram className="h-6 w-6 text-pink-500" />
            <span>Instagram Reels Official Graph API</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect your Instagram Creator/Business account for 1-click automated Reels publishing.
          </p>
        </div>
      </div>

      <Card className="space-y-6 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            <span>Instagram Account Status</span>
          </CardTitle>

          {status?.connected ? (
            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Account Connected</span>
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
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 p-0.5">
                <div className="h-full w-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-lg text-pink-400">
                  📸
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm">
                  {status.accountName}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {status.accountId}
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
              Disconnect Instagram
            </Button>
          </div>
        ) : (
          <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-4">
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Authenticate with your Meta developer App to publish Reels directly into your Instagram feed with captions and hashtags.
            </p>

            <a href="/api/auth/meta" className="inline-block">
              <Button size="md" variant="primary" className="gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                <Instagram className="h-4 w-4" />
                <span>Connect Instagram with Meta Login</span>
              </Button>
            </a>
          </div>
        )}

        {/* Credentials Setup Guide */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Meta for Developers App Setup
          </h4>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <p>1. Go to <a href="https://developers.facebook.com" target="_blank" className="text-pink-400 underline">developers.facebook.com</a> and create a Business App.</p>
            <p>2. Add <strong>Instagram Graph API</strong> & <strong>Facebook Login</strong>.</p>
            <p>3. Add Redirect URI: <code>http://localhost:3000/api/auth/callback/meta</code></p>
            <p>4. Add your App ID & App Secret to <code>.env</code>:</p>
            <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono">
              META_APP_ID=your_meta_app_id<br/>
              META_APP_SECRET=your_meta_app_secret
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
