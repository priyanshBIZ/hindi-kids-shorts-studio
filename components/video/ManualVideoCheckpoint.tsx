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
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const hasVideoAttached = Boolean(existingVideo?.status === "READY" || uploadedFileUrl);

  return (
    <Card className="border-amber-500/30 bg-slate-900/90 space-y-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Google Flow Video Checkpoint
            </span>
            <CardTitle className="text-lg text-slate-100">
              Video Upload & Storage Management
            </CardTitle>
          </div>
        </div>

        {hasVideoAttached ? (
          <Badge variant="success" className="gap-1.5 py-1 px-3">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>MP4 Video Ready</span>
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
          <p className="text-slate-400 text-[11px]">Copy individual or bundled prompts from tab 1.</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
          <span className="text-amber-400 font-bold uppercase tracking-wide">Step 2</span>
          <p className="text-slate-200 font-medium">Generate in Google Flow</p>
          <p className="text-slate-400 text-[11px]">Paste prompts in Google Flow / Veo to render scenes.</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
          <span className="text-amber-400 font-bold uppercase tracking-wide">Step 3</span>
          <p className="text-slate-200 font-medium">Combine in Scenebuilder</p>
          <p className="text-slate-400 text-[11px]">Drag clips into Flow timeline, export as 9:16 MP4.</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
          <span className="text-amber-400 font-bold uppercase tracking-wide">Step 4</span>
          <p className="text-slate-200 font-medium">Upload Fresh MP4</p>
          <p className="text-slate-400 text-[11px]">Upload below for 1-click & 10 AM auto-publishing.</p>
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

      {/* MP4 File Upload Area */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="space-y-3 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <UploadCloud className="h-4 w-4" />
              <span>Upload Fresh 9:16 MP4 Short Video</span>
            </div>
            <span className="text-[11px] text-slate-500">Auto-publishes daily at 10:00 AM & auto-purges Blob storage</span>
          </div>

          {uploadedFileUrl ? (
            /* Uploaded — show file info + delete button */
            <div className="space-y-3 p-4 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono truncate">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="truncate">Attached MP4: {uploadedFileUrl.split("/").pop()}</span>
                </p>
                <a
                  href={uploadedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>Preview Video</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex gap-3">
                {/* Re-upload button */}
                <label className="flex-1 border border-dashed border-slate-700 hover:border-amber-500/60 rounded-lg p-2.5 text-center cursor-pointer transition-colors bg-slate-950">
                  <input
                    type="file"
                    accept="video/mp4,video/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
                    <FileVideo className="h-4 w-4 text-orange-400" />
                    <span>{uploading ? "Uploading new file..." : "Replace MP4 Video"}</span>
                  </div>
                </label>

                {/* Delete button */}
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  isLoading={deleting}
                  onClick={handleDeleteVideo}
                  className="text-xs px-4 gap-1.5"
                  title="Delete uploaded video from storage"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          ) : (
            /* No file yet — show prominent upload area */
            <label className="border-2 border-dashed border-amber-500/40 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer block transition-colors bg-amber-500/5 hover:bg-amber-500/10">
              <input
                type="file"
                accept="video/mp4,video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <FileVideo className="h-8 w-8 text-orange-400" />
                <span className="text-sm font-bold text-slate-200">
                  {uploading ? "Uploading MP4 to Vercel Storage..." : "Click to Choose Fresh MP4 Video File"}
                </span>
                <p className="text-xs text-slate-400">
                  Supports 9:16 vertical MP4 video format. Automatically enables 10 AM auto-pilot publish.
                </p>
              </div>
            </label>
          )}
        </div>
      </div>
    </Card>
  );
}
