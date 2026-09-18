"use client";

import React, { useState } from "react";
import { upload } from "@vercel/blob/client";
import { 
  Video, 
  UploadCloud, 
  Link as LinkIcon, 
  CheckCircle2, 
  ExternalLink, 
  Youtube, 
  Sparkles,
  FileVideo,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function ManualVideoCheckpoint({
  storyId,
  existingVideo,
  onVideoSaved,
}: {
  storyId: string;
  existingVideo?: {
    id?: string;
    fileUrl?: string | null;
    youtubeUrl?: string | null;
    status?: string;
    createdAt?: string;
  } | null;
  onVideoSaved: () => void;
}) {
  const [youtubeUrl, setYoutubeUrl] = useState(existingVideo?.youtubeUrl || "");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(existingVideo?.fileUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("mp4") && !file.type.includes("video")) {
      setError("Please select a valid MP4 video file.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Client-side upload: goes directly from browser → Vercel Blob (no 4.5MB server limit)
      const blob = await upload(`videos/${storyId}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      const fileUrl = blob.url;
      setUploadedFileUrl(fileUrl);

      // Save the Blob URL to the story video record
      const saveRes = await fetch(`/api/stories/${storyId}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.error || "Failed to record video");

      setSuccessMsg("MP4 video uploaded and attached to story successfully!");
      onVideoSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload video");
    } finally {

      setUploading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!uploadedFileUrl) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this uploaded video? This cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: uploadedFileUrl, storyId }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Delete failed");

      setUploadedFileUrl(null);
      setSuccessMsg("Video file deleted successfully. You can upload a new one.");
      onVideoSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete video");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveYoutubeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setError("Please enter a valid YouTube Short URL.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/stories/${storyId}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          fileUrl: uploadedFileUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save video URL");

      setSuccessMsg("YouTube Short URL recorded! Story is ready for social metadata.");
      onVideoSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save YouTube URL");
    } finally {
      setSaving(false);
    }
  };

  const hasVideoAttached = Boolean(existingVideo?.status === "READY" || uploadedFileUrl || youtubeUrl);

  return (
    <Card className="border-amber-500/30 bg-slate-900/90 space-y-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              V1 Manual Video Checkpoint
            </span>
            <CardTitle className="text-lg text-slate-100">
              Google Flow & Video Recording
            </CardTitle>
          </div>
        </div>

        {hasVideoAttached ? (
          <Badge variant="success" className="gap-1.5 py-1 px-3">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Video Received</span>
          </Badge>
        ) : (
          <Badge variant="warning" className="gap-1.5 py-1 px-3">
            <span>Video Pending</span>
          </Badge>
        )}
      </CardHeader>

      {/* 4-Step Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
          <span className="text-amber-400 font-bold uppercase tracking-wide">Step 1</span>
          <p className="text-slate-200 font-medium">Copy Scene Prompts</p>
          <p className="text-slate-400 text-[11px]">Copy individual or bundled prompts from below.</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
          <span className="text-amber-400 font-bold uppercase tracking-wide">Step 2</span>
          <p className="text-slate-200 font-medium">Generate in Google Flow</p>
          <p className="text-slate-400 text-[11px]">Paste prompts in Google Flow / Veo to render scenes.</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
          <span className="text-amber-400 font-bold uppercase tracking-wide">Step 3</span>
          <p className="text-slate-200 font-medium">Combine in Scenebuilder</p>
          <p className="text-slate-400 text-[11px]">Drag all 5 clips into Flow timeline, export as 9:16 MP4.</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
          <span className="text-amber-400 font-bold uppercase tracking-wide">Step 4</span>
          <p className="text-slate-200 font-medium">Upload or Paste URL</p>
          <p className="text-slate-400 text-[11px]">Save below to advance pipeline to metadata.</p>
        </div>
      </div>

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

      {/* Checkpoint Input Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/80">
        {/* Option A: Paste YouTube Short URL */}
        <form onSubmit={handleSaveYoutubeUrl} className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
            <Youtube className="h-4 w-4" />
            <span>Option A: YouTube Short URL</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste the URL of your uploaded Short (e.g. <code>https://youtube.com/shorts/...</code>)
          </p>

          <div className="flex gap-2">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/shorts/..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Button
              type="submit"
              size="sm"
              isLoading={saving}
              variant="primary"
              className="text-xs px-4"
            >
              Save URL
            </Button>
          </div>

          {existingVideo?.youtubeUrl && (
            <a
              href={existingVideo.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline pt-1"
            >
              <span>View attached YouTube Short</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </form>

        {/* Option B: Upload MP4 Video File */}
        <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <UploadCloud className="h-4 w-4" />
              <span>Option B: Upload MP4 Video</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Store the actual 9:16 MP4 video directly in the studio storage.
            </p>
          </div>

          {uploadedFileUrl ? (
            /* Uploaded — show file info + delete button */
            <div className="space-y-2">
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono truncate">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span className="truncate">Uploaded: {uploadedFileUrl.split("/").pop()}</span>
              </p>

              <div className="flex gap-2">
                {/* Re-upload button */}
                <label className="flex-1 border border-dashed border-slate-700 hover:border-slate-500 rounded-lg p-2 text-center cursor-pointer transition-colors bg-slate-900/50">
                  <input
                    type="file"
                    accept="video/mp4,video/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <FileVideo className="h-3.5 w-3.5 text-orange-400" />
                    <span>{uploading ? "Uploading..." : "Replace Video"}</span>
                  </div>
                </label>

                {/* Delete button */}
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  isLoading={deleting}
                  onClick={handleDeleteVideo}
                  className="text-[11px] px-3 gap-1.5"
                  title="Delete uploaded video from storage"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          ) : (
            /* No file yet — show upload area */
            <label className="border border-dashed border-slate-700 hover:border-slate-500 rounded-lg p-3 text-center cursor-pointer block transition-colors bg-slate-900/50">
              <input
                type="file"
                accept="video/mp4,video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
                <FileVideo className="h-4 w-4 text-orange-400" />
                <span>{uploading ? "Uploading MP4..." : "Choose MP4 Video File"}</span>
              </div>
            </label>
          )}
        </div>
      </div>
    </Card>
  );
}
