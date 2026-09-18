"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Video, 
  Share2, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  Youtube, 
  Instagram, 
  Facebook, 
  Send, 
  AlertCircle,
  UploadCloud
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { PipelineStatus } from "@/components/dashboard/PipelineStatus";
import { FlowPromptViewer } from "@/components/video/FlowPromptViewer";
import { ManualVideoCheckpoint } from "@/components/video/ManualVideoCheckpoint";
import { MetadataStudio } from "@/components/metadata/MetadataStudio";
import { buildFlowPromptPackage } from "@/lib/ai/prompt-generator";

export default function StoryStudioPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"PROMPTS" | "VIDEO" | "METADATA" | "PUBLISH">("PROMPTS");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Publishing state
  const [ytStatus, setYtStatus] = useState<any>(null);
  const [igStatus, setIgStatus] = useState<any>(null);
  const [publishingYt, setPublishingYt] = useState(false);
  const [publishingIg, setPublishingIg] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  const fetchStory = async () => {
    try {
      const res = await fetch(`/api/stories/${storyId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setStory(data.data);
      } else {
        setError(data.error || "Story not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load story");
    } finally {
      setLoading(false);
    }
  };

  const fetchOAuthStatuses = async () => {
    try {
      const [ytRes, igRes] = await Promise.all([
        fetch("/api/youtube/status").then((r) => r.json()).catch(() => ({})),
        fetch("/api/instagram/status").then((r) => r.json()).catch(() => ({})),
      ]);
      setYtStatus(ytRes.data || null);
      setIgStatus(igRes.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (storyId) {
      fetchStory();
      fetchOAuthStatuses();
    }
  }, [storyId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/content");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handlePublishYouTube = async () => {
    setPublishingYt(true);
    setError(null);
    setPublishSuccessMsg(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/publish/youtube`, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "YouTube publishing failed");

      setPublishSuccessMsg("Published to YouTube Shorts successfully!");
      await fetchStory();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish to YouTube");
    } finally {
      setPublishingYt(false);
    }
  };

  const handlePublishInstagram = async () => {
    setPublishingIg(true);
    setError(null);
    setPublishSuccessMsg(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/publish/instagram`, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Instagram publishing failed");

      setPublishSuccessMsg("Published to Instagram Reels successfully!");
      await fetchStory();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish to Instagram");
    } finally {
      setPublishingIg(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-8 bg-slate-900 rounded-lg w-1/3" />
        <div className="h-44 bg-slate-900 rounded-xl" />
        <div className="h-96 bg-slate-900 rounded-xl" />
      </div>
    );
  }

  if (error && !story) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-semibold text-slate-100">{error || "Story not found"}</h2>
        <Link href="/content">
          <Button variant="secondary" size="sm">Back to Library</Button>
        </Link>
      </div>
    );
  }

  const flowPackage = buildFlowPromptPackage({
    title: story.title,
    durationSeconds: story.durationSeconds,
    scenes: story.scenes,
  });

  const latestVideo = story.videos && story.videos.length > 0 ? story.videos[0] : null;
  const hasVideo = Boolean(latestVideo?.status === "READY");
  const hasMp4File = Boolean(story.videos?.some((v: any) => v.fileUrl));
  const hasMetadata = Boolean(story.metadata);
  const isPublishReady = hasVideo && hasMetadata;

  const ytPublication = story.publications?.find((p: any) => p.platform === "YOUTUBE" && p.status === "PUBLISHED");
  const igPublication = story.publications?.find((p: any) => p.platform === "INSTAGRAM" && p.status === "PUBLISHED");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/content" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={story.status} />
              <span className="text-xs text-slate-500">• {story.durationSeconds}s duration</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mt-1">
              {story.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            isLoading={deleting}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {publishSuccessMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{publishSuccessMsg}</span>
        </div>
      )}

      {/* Story Summary Card & Pipeline */}
      <Card className="bg-slate-900/80 border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Concept:</span>
            <p className="text-slate-200 mt-1">{story.concept}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-amber-400 font-semibold uppercase tracking-wider">Moral Lesson:</span>
            <p className="text-amber-200 mt-1 italic">{story.moral}</p>
          </div>
        </div>

        <PipelineStatus
          status={story.status}
          hasVideo={hasVideo}
          hasMetadata={hasMetadata}
          isPublished={story.status === "PUBLISHED"}
        />
      </Card>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveView("PROMPTS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeView === "PROMPTS"
              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
              : "bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>1. Flow Prompts & Scenes ({story.scenes?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveView("VIDEO")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeView === "VIDEO"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Video className="h-3.5 w-3.5" />
          <span>2. Video Checkpoint {hasVideo && "✅"}</span>
        </button>

        <button
          onClick={() => setActiveView("METADATA")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeView === "METADATA"
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
              : "bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>3. Social Metadata {hasMetadata && "✅"}</span>
        </button>

        <button
          onClick={() => setActiveView("PUBLISH")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeView === "PUBLISH"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          <span>4. Publishing Review & 1-Click Launch</span>
        </button>
      </div>

      {/* Tab 1: Flow Prompts Studio */}
      {activeView === "PROMPTS" && (
        <FlowPromptViewer flowPackage={flowPackage} />
      )}

      {/* Tab 2: Manual Video Checkpoint */}
      {activeView === "VIDEO" && (
        <ManualVideoCheckpoint
          storyId={story.id}
          existingVideo={latestVideo}
          onVideoSaved={fetchStory}
        />
      )}

      {/* Tab 3: Social Metadata Studio */}
      {activeView === "METADATA" && (
        <MetadataStudio
          storyId={story.id}
          initialMetadata={story.metadata}
          onMetadataUpdated={fetchStory}
        />
      )}

      {/* Tab 4: Publishing Review */}
      {activeView === "PUBLISH" && (
        <Card className="space-y-6">
          <CardHeader>
            <CardTitle className="text-lg">
              Official Publishing & Distribution Studio
            </CardTitle>
            <StatusBadge status={story.status} />
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* YouTube Shorts Card */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-red-500/30 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-red-400 flex items-center gap-1.5">
                    <Youtube className="h-4 w-4" /> YouTube Shorts
                  </h4>
                  {ytStatus?.connected ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Connected
                    </span>
                  ) : (
                    <Link href="/settings/youtube" className="text-[10px] text-red-400 hover:underline">
                      Connect Channel
                    </Link>
                  )}
                </div>

                {ytPublication?.platformUrl ? (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs space-y-1">
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Published to Shorts!
                    </span>
                    <a
                      href={ytPublication.platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1 text-[11px] truncate"
                    >
                      <span>{ytPublication.platformUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                ) : latestVideo?.youtubeUrl ? (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                    <span className="text-slate-300 font-medium">Recorded Short Reference:</span>
                    <a
                      href={latestVideo.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1 text-[11px] truncate"
                    >
                      <span>{latestVideo.youtubeUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Upload MP4 video in Tab 2 to enable direct 1-click YouTube publishing.
                  </p>
                )}
              </div>

              {/* 1-Click YouTube Upload Button */}
              {ytStatus?.connected ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handlePublishYouTube}
                  isLoading={publishingYt}
                  disabled={!hasMp4File || Boolean(ytPublication)}
                  className="w-full text-xs gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                >
                  <Youtube className="h-3.5 w-3.5" />
                  <span>{ytPublication ? "Published to YouTube ✅" : "1-Click Publish to YouTube"}</span>
                </Button>
              ) : (
                <Link href="/settings/youtube" className="w-full">
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 text-red-400 border-red-500/30">
                    <Youtube className="h-3.5 w-3.5" />
                    <span>Connect Channel in Settings</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Instagram Reels Card */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-pink-500/30 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-pink-400 flex items-center gap-1.5">
                    <Instagram className="h-4 w-4" /> Instagram Reels
                  </h4>
                  {igStatus?.connected ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Connected
                    </span>
                  ) : (
                    <Link href="/settings/instagram" className="text-[10px] text-pink-400 hover:underline">
                      Connect Meta
                    </Link>
                  )}
                </div>

                {igPublication?.platformUrl ? (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs space-y-1">
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Published to Instagram!
                    </span>
                    <a
                      href={igPublication.platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1 text-[11px] truncate"
                    >
                      <span>{igPublication.platformUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    {story.metadata?.instagramCaption
                      ? "Caption & Hashtags ready for Graph API upload."
                      : "Generate social metadata in Tab 3 first."}
                  </p>
                )}
              </div>

              {/* 1-Click Instagram Upload Button */}
              {igStatus?.connected ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handlePublishInstagram}
                  isLoading={publishingIg}
                  disabled={!hasMp4File || Boolean(igPublication)}
                  className="w-full text-xs gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  <span>{igPublication ? "Published to Instagram ✅" : "1-Click Publish to Instagram"}</span>
                </Button>
              ) : (
                <Link href="/settings/instagram" className="w-full">
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 text-pink-400 border-pink-500/30">
                    <Instagram className="h-3.5 w-3.5" />
                    <span>Connect Meta in Settings</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Facebook Reels Card */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-blue-500/30 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-blue-400 flex items-center gap-1.5">
                    <Facebook className="h-4 w-4" /> Facebook Reels
                  </h4>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    Manual Copy
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use generated family-friendly Hindi captions and descriptions in Tab 3 for Facebook Pages & Groups.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveView("METADATA")}
                className="w-full text-xs gap-1.5 text-blue-400 border-blue-500/30"
              >
                <span>Copy Facebook Copy</span>
              </Button>
            </div>
          </div>

          {/* Publishing Checklist Bar */}
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-slate-100">Overall Pipeline Status:</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {isPublishReady
                  ? "All video checkpoints and social metadata are ready for distribution."
                  : "Complete video recording and social metadata generation to finish production."}
              </p>
            </div>

            <Button
              size="md"
              variant={isPublishReady ? "success" : "secondary"}
              disabled={!isPublishReady}
              onClick={async () => {
                await fetch(`/api/stories/${story.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "PUBLISHED" }),
                });
                fetchStory();
              }}
              className="gap-2 shrink-0 font-semibold"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{story.status === "PUBLISHED" ? "Marked as Published ✅" : "Mark as Published"}</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
