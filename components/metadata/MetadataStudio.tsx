"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Youtube, 
  Instagram, 
  Facebook, 
  Copy, 
  Check, 
  Save, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlatformMetadata } from "@/types/platform";

export function MetadataStudio({
  storyId,
  initialMetadata,
  onMetadataUpdated,
}: {
  storyId: string;
  initialMetadata?: PlatformMetadata | null;
  onMetadataUpdated: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"YOUTUBE" | "INSTAGRAM" | "FACEBOOK">("YOUTUBE");
  const [metadata, setMetadata] = useState<PlatformMetadata>(initialMetadata || {
    youtubeTitle: "",
    youtubeDescription: "",
    youtubeTags: "",
    youtubeHashtags: "",
    instagramCaption: "",
    instagramHashtags: "",
    facebookCaption: "",
    facebookHashtags: "",
  });

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/stories/${storyId}/metadata`, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");

      setMetadata(data.data);
      setSuccessMsg("Multi-platform metadata generated successfully!");
      onMetadataUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate metadata");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/stories/${storyId}/metadata`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Save failed");

      setSuccessMsg("Metadata changes saved successfully!");
      onMetadataUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save metadata");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const hasGeneratedMetadata = Boolean(
    metadata.youtubeTitle || metadata.instagramCaption || metadata.facebookCaption
  );

  return (
    <Card className="border-purple-500/30 bg-slate-900/90 space-y-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold">
              Social Distribution
            </span>
            <CardTitle className="text-lg text-slate-100">
              Platform Metadata Studio
            </CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={handleGenerate}
            isLoading={generating}
            className="text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{hasGeneratedMetadata ? "Regenerate Metadata" : "Generate Metadata"}</span>
          </Button>

          {hasGeneratedMetadata && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSave}
              isLoading={saving}
              className="text-xs gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Edits</span>
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Platform Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("YOUTUBE")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "YOUTUBE"
              ? "border-red-500 text-red-400 bg-red-500/10 rounded-t-lg"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Youtube className="h-4 w-4" />
          <span>YouTube Shorts</span>
        </button>

        <button
          onClick={() => setActiveTab("INSTAGRAM")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "INSTAGRAM"
              ? "border-pink-500 text-pink-400 bg-pink-500/10 rounded-t-lg"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Instagram className="h-4 w-4" />
          <span>Instagram Reels</span>
        </button>

        <button
          onClick={() => setActiveTab("FACEBOOK")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "FACEBOOK"
              ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Facebook className="h-4 w-4" />
          <span>Facebook Reels</span>
        </button>
      </div>

      {/* Tab Panels */}
      {!hasGeneratedMetadata && (
        <div className="py-8 text-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">
            No metadata generated yet. Click "Generate Metadata" above to create YouTube, Instagram, and Facebook packages with Gemini.
          </p>
        </div>
      )}

      {hasGeneratedMetadata && activeTab === "YOUTUBE" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>YouTube Video Title (Shorts Optimized)</span>
              <button
                onClick={() => copyToClipboard(metadata.youtubeTitle || "", "yt-title")}
                className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1"
              >
                {copied === "yt-title" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy Title</span>
              </button>
            </div>
            <input
              type="text"
              value={metadata.youtubeTitle || ""}
              onChange={(e) => setMetadata({ ...metadata, youtubeTitle: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>YouTube Description</span>
              <button
                onClick={() => copyToClipboard(metadata.youtubeDescription || "", "yt-desc")}
                className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1"
              >
                {copied === "yt-desc" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy Description</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={metadata.youtubeDescription || ""}
              onChange={(e) => setMetadata({ ...metadata, youtubeDescription: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Tags (Comma-separated)</span>
                <button
                  onClick={() => copyToClipboard(metadata.youtubeTags || "", "yt-tags")}
                  className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1"
                >
                  {copied === "yt-tags" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>Copy Tags</span>
                </button>
              </div>
              <input
                type="text"
                value={metadata.youtubeTags || ""}
                onChange={(e) => setMetadata({ ...metadata, youtubeTags: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Hashtags</span>
                <button
                  onClick={() => copyToClipboard(metadata.youtubeHashtags || "", "yt-hash")}
                  className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1"
                >
                  {copied === "yt-hash" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>Copy Hashtags</span>
                </button>
              </div>
              <input
                type="text"
                value={metadata.youtubeHashtags || ""}
                onChange={(e) => setMetadata({ ...metadata, youtubeHashtags: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {hasGeneratedMetadata && activeTab === "INSTAGRAM" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Instagram Caption & Hook</span>
              <button
                onClick={() => copyToClipboard(metadata.instagramCaption || "", "ig-cap")}
                className="text-[11px] text-slate-400 hover:text-pink-400 flex items-center gap-1"
              >
                {copied === "ig-cap" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy Caption</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={metadata.instagramCaption || ""}
              onChange={(e) => setMetadata({ ...metadata, instagramCaption: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Instagram Hashtags</span>
              <button
                onClick={() => copyToClipboard(metadata.instagramHashtags || "", "ig-hash")}
                className="text-[11px] text-slate-400 hover:text-pink-400 flex items-center gap-1"
              >
                {copied === "ig-hash" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy Hashtags</span>
              </button>
            </div>
            <input
              type="text"
              value={metadata.instagramHashtags || ""}
              onChange={(e) => setMetadata({ ...metadata, instagramHashtags: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      )}

      {hasGeneratedMetadata && activeTab === "FACEBOOK" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Facebook Caption & Post Copy</span>
              <button
                onClick={() => copyToClipboard(metadata.facebookCaption || "", "fb-cap")}
                className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1"
              >
                {copied === "fb-cap" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy Caption</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={metadata.facebookCaption || ""}
              onChange={(e) => setMetadata({ ...metadata, facebookCaption: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Facebook Hashtags</span>
              <button
                onClick={() => copyToClipboard(metadata.facebookHashtags || "", "fb-hash")}
                className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1"
              >
                {copied === "fb-hash" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy Hashtags</span>
              </button>
            </div>
            <input
              type="text"
              value={metadata.facebookHashtags || ""}
              onChange={(e) => setMetadata({ ...metadata, facebookHashtags: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
