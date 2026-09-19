"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  Video, 
  UploadCloud, 
  FileVideo, 
  ArrowRight,
  Trash2,
  AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { upload } from "@vercel/blob/client";

interface StoryItem {
  id: string;
  title: string;
  concept: string;
  status: string;
  scheduledFor?: string | null;
  createdAt: string;
  videos?: { fileUrl?: string | null; youtubeUrl?: string | null; status?: string }[];
}

export function WeeklyProductionHub({
  stories,
  onRefresh,
}: {
  stories: StoryItem[];
  onRefresh: () => void;
}) {
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [cleaningStorage, setCleaningStorage] = useState(false);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Generate 7-Day Batch
  const handleGenerate7DayBatch = async () => {
    setGeneratingBatch(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/stories/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Batch generation failed");

      setStatusMsg({
        type: "success",
        text: `🎉 Generated 7 stories scheduled for daily 10:00 AM auto-publishing!`,
      });
      onRefresh();
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create 7-day batch",
      });
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Clean Storage
  const handleCleanupStorage = async () => {
    if (!window.confirm("Clean up published video MP4 files from Vercel Blob storage?")) return;
    setCleaningStorage(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/storage/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Cleanup failed");

      setStatusMsg({
        type: "success",
        text: `🧹 ${data.message}`,
      });
      onRefresh();
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Storage cleanup failed",
      });
    } finally {
      setCleaningStorage(false);
    }
  };

  // Upload MP4 directly for a specific story card
  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>, storyId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingForId(storyId);
    setStatusMsg(null);

    try {
      const blob = await upload(`videos/${storyId}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      const saveRes = await fetch(`/api/stories/${storyId}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: blob.url }),
      });

      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.error || "Failed to record video");

      setStatusMsg({
        type: "success",
        text: `✅ Video uploaded and attached for story! Auto-publishes at 10:00 AM.`,
      });
      onRefresh();
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setUploadingForId(null);
    }
  };

  // Build 7-day schedule slots starting from Saturday (or current week)
  const getWeeklySlots = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
    const diffToSat = (6 - dayOfWeek + 7) % 7; // Days until upcoming Saturday (or today if Sat)

    const satDate = new Date(today);
    satDate.setDate(today.getDate() - (dayOfWeek === 6 ? 0 : dayOfWeek + 1));
    satDate.setHours(10, 0, 0, 0);

    const slots = [];
    for (let i = 0; i < 7; i++) {
      const slotDate = new Date(satDate);
      slotDate.setDate(satDate.getDate() + i);

      // Find story matching this scheduled date (or closest)
      const matchedStory = stories.find((s) => {
        if (!s.scheduledFor) return false;
        const d = new Date(s.scheduledFor);
        return (
          d.getDate() === slotDate.getDate() &&
          d.getMonth() === slotDate.getMonth() &&
          d.getFullYear() === slotDate.getFullYear()
        );
      });

      slots.push({
        date: slotDate,
        dayName: slotDate.toLocaleDateString("en-US", { weekday: "short" }),
        formattedDate: slotDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        story: matchedStory || null,
        isToday:
          today.getDate() === slotDate.getDate() &&
          today.getMonth() === slotDate.getMonth() &&
          today.getFullYear() === slotDate.getFullYear(),
      });
    }

    return slots;
  };

  const slots = getWeeklySlots();

  return (
    <Card className="border-orange-500/30 bg-slate-900/90 space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <CalendarDays className="h-4 w-4" />
            <span>Saturday 7-Day Production Hub</span>
          </div>
          <CardTitle className="text-xl text-slate-100">
            Weekly Auto-Pilot Schedule (10:00 AM Daily Publish)
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-orange-400" />
            <span>Generate 7 Shorts every Saturday. Auto-publishes daily at 10:00 AM & auto-cleans Blob storage.</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            isLoading={generatingBatch}
            onClick={handleGenerate7DayBatch}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-semibold"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate 7-Day Batch</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            isLoading={cleaningStorage}
            onClick={handleCleanupStorage}
            className="gap-1.5 border-slate-700 hover:border-slate-500 text-xs"
            title="Purge published video MP4 files from Vercel Blob storage"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
            <span>Clear Published Storage</span>
          </Button>
        </div>
      </div>

      {/* Action Notification */}
      {statusMsg && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 7-Day Pipeline Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {slots.map((slot, index) => {
          const story = slot.story;
          const hasVideo = Boolean(story?.videos && story.videos.length > 0 && (story.videos[0]?.fileUrl || story.videos[0]?.youtubeUrl));
          const isPublished = story?.status === "PUBLISHED";

          return (
            <div
              key={index}
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                slot.isToday
                  ? "bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10"
                  : "bg-slate-950/70 border-slate-800/80"
              }`}
            >
              {/* Slot Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-amber-400 uppercase">{slot.dayName}</span>
                    <span className="text-[10px] text-slate-400">({slot.formattedDate})</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">10 AM</span>
                </div>

                {/* Story Info */}
                {story ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-tight">
                      {story.title}
                    </p>

                    {/* Status Badge */}
                    {isPublished ? (
                      <Badge variant="success" className="text-[10px] py-0.5 px-2 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Published</span>
                      </Badge>
                    ) : hasVideo ? (
                      <Badge variant="warning" className="text-[10px] py-0.5 px-2 gap-1 bg-amber-500/20 text-amber-300">
                        <Video className="h-3 w-3" />
                        <span>Ready (10 AM)</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] py-0.5 px-2 text-slate-400">
                        <span>Prompts Ready</span>
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="py-3 text-center space-y-1">
                    <p className="text-[11px] text-slate-500 italic">No story yet</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-800/60 space-y-2">
                {story ? (
                  <>
                    {/* View Story link */}
                    <Link
                      href={`/content/${story.id}`}
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center justify-between font-medium group"
                    >
                      <span>Open Studio</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                    {/* Quick MP4 Upload button */}
                    {!isPublished && (
                      <label className="block border border-dashed border-slate-700 hover:border-amber-500/60 rounded-lg p-1.5 text-center cursor-pointer transition-colors bg-slate-900/50">
                        <input
                          type="file"
                          accept="video/mp4,video/*"
                          disabled={uploadingForId === story.id}
                          onChange={(e) => handleDirectUpload(e, story.id)}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-300">
                          <FileVideo className="h-3 w-3 text-orange-400" />
                          <span>{uploadingForId === story.id ? "Uploading..." : hasVideo ? "Replace MP4" : "Upload MP4"}</span>
                        </div>
                      </label>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleGenerate7DayBatch}
                    isLoading={generatingBatch}
                    className="w-full text-[10px] text-amber-400 hover:text-amber-300 py-1"
                  >
                    + Generate Week
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
