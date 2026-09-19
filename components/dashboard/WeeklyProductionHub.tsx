"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  Video, 
  FileVideo, 
  ArrowRight,
  Trash2,
  AlertCircle,
  Youtube,
  Lightbulb,
  Plus,
  RefreshCcw,
  Calendar
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
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
  videos?: { id?: string; fileUrl?: string | null; youtubeUrl?: string | null; status?: string }[];
}

export function WeeklyProductionHub({
  stories,
  onRefresh,
}: {
  stories: StoryItem[];
  onRefresh: () => void;
}) {
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [generatingForDay, setGeneratingForDay] = useState<number | null>(null);
  const [cleaningStorage, setCleaningStorage] = useState(false);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [batchMode, setBatchMode] = useState<"SAT" | "FRI_NIGHT" | "NEXT_WEEK">("SAT");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [ytUrlInputs, setYtUrlInputs] = useState<{ [id: string]: string }>({});
  const [savingYtId, setSavingYtId] = useState<string | null>(null);

  // 7 Pre-filled Trending Story Suggestions
  const weeklySuggestions = [
    { day: "Sat", title: "गज्जू और नन्ही चिड़िया", theme: "Baby elephant Gajju helps a baby sparrow return to nest." },
    { day: "Sun", title: "चीकू और जादुई अखरोट", theme: "Clever squirrel Chiku finds a huge walnut & shares with friends." },
    { day: "Mon", title: "मीनू चिड़िया का घोंसला", theme: "Little bird Meenu builds a sturdy nest with Golu bear." },
    { day: "Tue", title: "टॉमी कुत्ता और खोया बच्चा", theme: "Friendly dog Tommy guides a lost puppy back home." },
    { day: "Wed", title: "सोनू खरगोश की दौड़", theme: "Sonu rabbit learns that consistency is key to victory." },
    { day: "Thu", title: "रैम्बो मोर का नाच", theme: "Rambo peacock shares his umbrella-like feathers in rain." },
    { day: "Fri", title: "मिठू तोता और मीठा आम", theme: "Mithu parrot discovers a sweet mango tree & invites all birds." },
  ];

  // Helper to calculate start date based on chosen Batch Mode
  const getBatchStartDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat

    if (batchMode === "NEXT_WEEK") {
      const nextSat = new Date(today);
      const daysUntilNextSat = (6 - dayOfWeek + 7) % 7 || 7;
      nextSat.setDate(today.getDate() + daysUntilNextSat);
      nextSat.setHours(10, 0, 0, 0);
      return nextSat;
    }

    // Default: Saturday of current week (or today if Sat)
    const satDate = new Date(today);
    satDate.setDate(today.getDate() - (dayOfWeek === 6 ? 0 : (dayOfWeek + 1) % 7));
    satDate.setHours(10, 0, 0, 0);
    return satDate;
  };

  // Generate Full 7-Day Batch
  const handleGenerate7DayBatch = async () => {
    setGeneratingBatch(true);
    setStatusMsg(null);
    try {
      const startDate = getBatchStartDate();
      const res = await fetch("/api/stories/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: startDate.toISOString() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server returned error (${res.status}): ${text.slice(0, 100)}`);
      }

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

  // Generate a story for a single specific day slot
  const handleGenerateSingleDay = async (slotDate: Date, dayIndex: number) => {
    setGeneratingForDay(dayIndex);
    setStatusMsg(null);
    try {
      const preset = weeklySuggestions[dayIndex] || weeklySuggestions[0];
      const scheduledDate = new Date(slotDate);
      scheduledDate.setHours(10, 0, 0, 0);

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: preset.theme,
          characterName: preset.title,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text.slice(0, 80)}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");

      // Attach scheduled date to the generated story
      if (data.data?.id) {
        await fetch(`/api/stories/${data.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduledFor: scheduledDate.toISOString() }),
        });
      }

      setStatusMsg({
        type: "success",
        text: `✅ Generated story for ${slotDate.toLocaleDateString("en-US", { weekday: "long" })} (10:00 AM)!`,
      });
      onRefresh();
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Single day generation failed",
      });
    } finally {
      setGeneratingForDay(null);
    }
  };

  // Save YouTube Short URL for a specific story card
  const handleSaveYoutubeUrlForStory = async (storyId: string) => {
    const url = ytUrlInputs[storyId]?.trim();
    if (!url) {
      setStatusMsg({ type: "error", text: "Please enter a valid YouTube Short URL." });
      return;
    }
    setSavingYtId(storyId);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: url }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save YouTube URL");
      setStatusMsg({
        type: "success",
        text: "✅ YouTube Short URL attached! Scheduled for 10:00 AM publishing.",
      });
      onRefresh();
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save YouTube URL",
      });
    } finally {
      setSavingYtId(null);
    }
  };

  // Immediate Publish Now Button for Today's video
  const handlePublishNow = async (storyId: string) => {
    setPublishingId(storyId);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/publish/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacyStatus: "public" }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Publish error (${res.status}): ${text.slice(0, 100)}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "YouTube publish failed");

      setStatusMsg({
        type: "success",
        text: `🚀 Story published to YouTube Shorts successfully! Vercel Blob storage auto-cleaned.`,
      });
      onRefresh();
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish to YouTube",
      });
    } finally {
      setPublishingId(null);
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

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Cleanup error (${res.status}): ${text.slice(0, 80)}`);
      }

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
        text: `✅ Video uploaded and attached! Scheduled for 10:00 AM auto-publishing.`,
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
    const satDate = getBatchStartDate();
    const today = new Date();

    const assignedStoryIds = new Set<string>();
    const slots = [];

    for (let i = 0; i < 7; i++) {
      const slotDate = new Date(satDate);
      slotDate.setDate(satDate.getDate() + i);

      // 1. Try to find a story whose scheduledFor date matches slotDate exactly
      let matchedStory = stories.find((s) => {
        if (assignedStoryIds.has(s.id)) return false;
        if (!s.scheduledFor) return false;
        const d = new Date(s.scheduledFor);
        return (
          d.getDate() === slotDate.getDate() &&
          d.getMonth() === slotDate.getMonth() &&
          d.getFullYear() === slotDate.getFullYear()
        );
      });

      // 2. If no scheduledFor match, try matching by createdAt date (if distinct)
      if (!matchedStory) {
        matchedStory = stories.find((s) => {
          if (assignedStoryIds.has(s.id)) return false;
          if (s.scheduledFor) return false;
          const c = new Date(s.createdAt);
          return (
            c.getDate() === slotDate.getDate() &&
            c.getMonth() === slotDate.getMonth() &&
            c.getFullYear() === slotDate.getFullYear()
          );
        });
      }

      // 3. Fallback: assign next available unassigned story to fill slots 0 to 6
      if (!matchedStory) {
        const unassigned = stories.filter((s) => !assignedStoryIds.has(s.id));
        if (unassigned.length > 0) {
          matchedStory = unassigned[0];
        }
      }

      if (matchedStory) {
        assignedStoryIds.add(matchedStory.id);
      }

      const suggestion = weeklySuggestions[i] || weeklySuggestions[0];

      slots.push({
        date: slotDate,
        dayName: slotDate.toLocaleDateString("en-US", { weekday: "short" }),
        fullDayName: slotDate.toLocaleDateString("en-US", { weekday: "long" }),
        formattedDate: slotDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        story: matchedStory || null,
        suggestion,
        isToday:
          today.getDate() === slotDate.getDate() &&
          today.getMonth() === slotDate.getMonth() &&
          today.getFullYear() === slotDate.getFullYear(),
      });
    }

    return slots;
  };

  const slots = getWeeklySlots();
  const todaySlot = slots.find((s) => s.isToday);
  const todayStory = todaySlot?.story;

  return (
    <Card className="border-orange-500/30 bg-slate-900/95 space-y-6 p-6 shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <CalendarDays className="h-4 w-4" />
            <span>Weekly Batch Production Hub (Sat – Fri)</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl text-slate-100 font-bold">
            7-Day Auto-Pilot Publishing Dashboard
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <span>Batch generate 7 Shorts on Friday Night or Saturday Morning. Auto-publishes daily at 10:00 AM & purges Vercel storage.</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Batch Mode Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setBatchMode("SAT")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                batchMode === "SAT" ? "bg-amber-500/20 text-amber-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setBatchMode("NEXT_WEEK")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                batchMode === "NEXT_WEEK" ? "bg-amber-500/20 text-amber-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Next Week
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="gap-1.5 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>{showSuggestions ? "Hide Ideas" : "7 Pre-filled Ideas"}</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            isLoading={generatingBatch}
            onClick={handleGenerate7DayBatch}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-semibold text-xs shadow-md shadow-amber-500/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate All 7 Days</span>
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
            <span>Clear Storage</span>
          </Button>
        </div>
      </div>

      {/* TODAY'S URGENT ACTION ALERT BANNER */}
      {todayStory && (
        <div className="p-4 rounded-xl border border-amber-500/50 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-400 uppercase tracking-wider">
                  TODAY'S ACTION ALERT ({todaySlot?.fullDayName}, {todaySlot?.formattedDate})
                </span>
                <Badge variant="warning" className="text-[10px] bg-amber-500/20 text-amber-300">
                  10:00 AM Target
                </Badge>
              </div>
              <h4 className="font-bold text-slate-100 text-sm sm:text-base mt-0.5">
                {todayStory.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {todayStory.status === "PUBLISHED"
                  ? "✅ Story is published to YouTube Shorts!"
                  : todayStory.videos?.[0]?.fileUrl || todayStory.videos?.[0]?.youtubeUrl
                  ? "Video attached and ready! Click Publish Now to upload immediately to YouTube Shorts."
                  : "Prompts ready! Upload 9:16 MP4 video or paste YouTube Short URL below."}
              </p>
            </div>
          </div>

          {todayStory.status !== "PUBLISHED" && (
            <Button
              size="md"
              variant="primary"
              isLoading={publishingId === todayStory.id}
              onClick={() => handlePublishNow(todayStory.id)}
              className="gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-xs shrink-0 font-bold px-4 py-2 shadow-lg shadow-red-600/30"
            >
              <Youtube className="h-4 w-4" />
              <span>Publish Now to YouTube</span>
            </Button>
          )}
        </div>
      )}

      {/* 7-DAY PRE-FILLED IDEAS DRAWER */}
      {showSuggestions && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>7-Day Pre-filled Hindi Kids Curriculum (Sat – Fri)</span>
            </h4>
            <span className="text-[11px] text-slate-500">Auto-filled during 7-day batch generation</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {weeklySuggestions.map((idea) => (
              <div key={idea.day} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 hover:border-amber-500/40 transition-colors">
                <span className="font-bold text-[11px] text-amber-400 uppercase block">{idea.day}: {idea.title}</span>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{idea.theme}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Notification Message */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
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

      {/* 7-DAY PIPELINE CARDS (ROOMY & BEAUTIFUL GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
        {slots.map((slot, index) => {
          const story = slot.story;
          const hasVideo = Boolean(story?.videos && story.videos.length > 0 && (story.videos[0]?.fileUrl || story.videos[0]?.youtubeUrl));
          const existingYtUrl = story?.videos?.[0]?.youtubeUrl;
          const isPublished = story?.status === "PUBLISHED";

          return (
            <div
              key={index}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3.5 transition-all ${
                slot.isToday
                  ? "bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40"
                  : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Slot Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 shadow-sm">
                  <div>
                    <span className="font-bold text-xs text-amber-400 uppercase tracking-wide">{slot.dayName}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({slot.formattedDate})</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">10 AM</span>
                </div>

                {/* Story Title & Status */}
                {story ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
                      {story.title}
                    </p>

                    {isPublished ? (
                      <Badge variant="success" className="text-[10px] py-0.5 px-2 gap-1 w-full justify-center">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Published</span>
                      </Badge>
                    ) : hasVideo ? (
                      <Badge variant="warning" className="text-[10px] py-0.5 px-2 gap-1 bg-amber-500/20 text-amber-300 border-amber-500/30 w-full justify-center">
                        <Video className="h-3 w-3" />
                        <span>Ready for 10 AM</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] py-0.5 px-2 text-slate-400 w-full justify-center">
                        <span>Prompts Ready</span>
                      </Badge>
                    )}

                    {existingYtUrl && (
                      <p className="text-[10px] text-red-400 font-medium truncate flex items-center gap-1">
                        <Youtube className="h-3 w-3 shrink-0" />
                        <span className="truncate">URL Linked</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-2.5 text-center space-y-1">
                    <span className="text-[10px] font-bold text-amber-400/90 uppercase block">{slot.suggestion.title}</span>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{slot.suggestion.theme}</p>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="pt-2 border-t border-slate-800/60 space-y-2">
                {story ? (
                  <>
                    <Link
                      href={`/content/${story.id}`}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center justify-between font-medium group py-0.5"
                    >
                      <span>Open Studio</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                    {!isPublished && hasVideo && (
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={publishingId === story.id}
                        onClick={() => handlePublishNow(story.id)}
                        className="w-full text-[11px] py-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 gap-1 font-semibold shadow-md"
                      >
                        <Youtube className="h-3 w-3" />
                        <span>Publish Now</span>
                      </Button>
                    )}

                    {!isPublished && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-800/40">
                        {/* Option 1: YouTube URL Paste */}
                        <div className="flex gap-1">
                          <input
                            type="url"
                            placeholder="Paste YT Short URL..."
                            value={ytUrlInputs[story.id] || ""}
                            onChange={(e) => setYtUrlInputs({ ...ytUrlInputs, [story.id]: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={savingYtId === story.id}
                            onClick={() => handleSaveYoutubeUrlForStory(story.id)}
                            className="px-1.5 py-1 text-[10px] bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 rounded font-semibold shrink-0 transition-colors"
                            title="Save YouTube URL"
                          >
                            {savingYtId === story.id ? "..." : "Save"}
                          </button>
                        </div>

                        {/* Option 2: Upload MP4 */}
                        <label className="block border border-dashed border-slate-700 hover:border-amber-500/60 rounded p-1 text-center cursor-pointer transition-colors bg-slate-900/60">
                          <input
                            type="file"
                            accept="video/mp4,video/*"
                            disabled={uploadingForId === story.id}
                            onChange={(e) => handleDirectUpload(e, story.id)}
                            className="hidden"
                          />
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-300 font-medium">
                            <FileVideo className="h-3 w-3 text-orange-400 shrink-0" />
                            <span>{uploadingForId === story.id ? "Uploading..." : hasVideo ? "Replace MP4" : "Upload MP4"}</span>
                          </div>
                        </label>
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={generatingForDay === index}
                    onClick={() => handleGenerateSingleDay(slot.date, index)}
                    className="w-full text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10 gap-1 py-1.5 font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Generate Day</span>
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
