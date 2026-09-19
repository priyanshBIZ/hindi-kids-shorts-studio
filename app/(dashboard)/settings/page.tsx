"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, ShieldCheck, RefreshCw, Cpu, Layers, Youtube, Instagram, Facebook, Trash2, CheckCircle2, AlertCircle, HardDrive } from "lucide-react";
import { ApiStatusCard } from "@/components/settings/ApiStatusCard";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [statusData, setStatusData] = useState<any | null>(null);
  const [storageStats, setStorageStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaningStorage, setCleaningStorage] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [healthRes, storageRes] = await Promise.all([
        fetch("/api/health").then((r) => r.json()).catch(() => ({})),
        fetch("/api/storage/cleanup").then((r) => r.json()).catch(() => ({})),
      ]);

      if (healthRes.success && healthRes.data) {
        setStatusData(healthRes.data);
      }
      if (storageRes.success && storageRes.data) {
        setStorageStats(storageRes.data);
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

  const handleCleanupStorage = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete published video files from Vercel Blob storage?"
    );
    if (!confirmed) return;

    setCleaningStorage(true);
    setCleanupMsg(null);
    try {
      const res = await fetch("/api/storage/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Cleanup failed");

      setCleanupMsg(data.message || "Vercel Blob storage cleaned up successfully!");
      await fetchStatus();
    } catch (err: unknown) {
      setCleanupMsg(err instanceof Error ? err.message : "Storage cleanup failed");
    } finally {
      setCleaningStorage(false);
    }
  };

  const subSettings = [
    { title: "Gemini AI & TTS", href: "/settings/ai", icon: Cpu, desc: "Configure model & temperature" },
    { title: "Google Flow / Video", href: "/settings/flow", icon: Layers, desc: "Flow prompt package & setup" },
    { title: "YouTube Shorts", href: "/settings/youtube", icon: Youtube, desc: "OAuth 2.0 channel integration" },
    { title: "Instagram Reels", href: "/settings/instagram", icon: Instagram, desc: "Meta Graph API setup" },
    { title: "Facebook Reels", href: "/settings/facebook", icon: Facebook, desc: "Pages API configuration" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="h-6 w-6 text-orange-400" />
            <span>Settings & API Status</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor API integration status and manage server credentials securely.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchStatus} isLoading={loading} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh All Statuses</span>
        </Button>
      </div>

      {/* Security Architecture Notice */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-slate-100">Zero Secret Leakage Security Policy</h4>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            All API keys (including <code>GEMINI_API_KEY</code> and OAuth secrets) are strictly loaded in server-side API routes and will never be returned to the client JavaScript or logged in plain text.
          </p>
        </div>
      </div>

      {/* Vercel Blob Storage Management Card */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Vercel Blob Storage Management
              </h3>
              <p className="text-xs text-slate-400">
                Uploaded video files are automatically deleted after publishing to YouTube. You can also manually trigger a storage purge.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="danger"
            isLoading={cleaningStorage}
            onClick={handleCleanupStorage}
            className="text-xs gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Published Storage</span>
          </Button>
        </div>

        {storageStats && (
          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
              <p className="text-slate-400 text-[11px]">Total Files Stored</p>
              <p className="text-base font-bold text-slate-100 mt-0.5">{storageStats.totalFilesStored}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
              <p className="text-slate-400 text-[11px]">Published (Can Delete)</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{storageStats.publishedFilesStored}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
              <p className="text-slate-400 text-[11px]">Pending Publish</p>
              <p className="text-base font-bold text-amber-400 mt-0.5">{storageStats.pendingFilesStored}</p>
            </div>
          </div>
        )}

        {cleanupMsg && (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>{cleanupMsg}</span>
          </p>
        )}
      </div>

      {/* Service Status Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Integration Health Status
        </h3>

        {loading && !statusData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : statusData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ApiStatusCard statusItem={statusData.gemini} onRefresh={fetchStatus} />
            <ApiStatusCard statusItem={statusData.geminiTTS} onRefresh={fetchStatus} />
            <ApiStatusCard statusItem={statusData.flow} onRefresh={fetchStatus} />
            <ApiStatusCard statusItem={statusData.youtube} onRefresh={fetchStatus} />
            <ApiStatusCard statusItem={statusData.instagram} onRefresh={fetchStatus} />
            <ApiStatusCard statusItem={statusData.facebook} onRefresh={fetchStatus} />
          </div>
        ) : null}
      </div>

      {/* Sub Settings Navigation Links */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Module Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {subSettings.map((sub) => {
            const Icon = sub.icon;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                className="p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-1 block group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 group-hover:text-orange-400">
                  <Icon className="h-4 w-4" />
                  <span>{sub.title}</span>
                </div>
                <p className="text-[11px] text-slate-400">{sub.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
