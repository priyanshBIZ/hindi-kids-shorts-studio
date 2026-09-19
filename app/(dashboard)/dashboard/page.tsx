"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { WeeklyProductionHub } from "@/components/dashboard/WeeklyProductionHub";
import { StoryCard } from "@/components/content/StoryCard";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories?limit=30");
      const data = await res.json();
      if (data.success && data.data) {
        setStories(data.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load stories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleGenerateTodayStory = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");

      await fetchStories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate story");
    } finally {
      setGenerating(false);
    }
  };

  const totalStories = stories.length;
  const readyToPublish = stories.filter((s) => s.status === "READY_TO_PUBLISH").length;
  const published = stories.filter((s) => s.status === "PUBLISHED").length;
  const videosAdded = stories.filter((s) => s.videos && s.videos.length > 0 && s.videos[0]?.status === "READY").length;

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
            <span>Hindi Kids Shorts Studio</span>
            <span className="text-xl">✨</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Saturday Batch Production Hub: Generate 7 Shorts every Saturday. Auto-publishes daily at 10:00 AM & auto-cleans Vercel storage.
          </p>
        </div>

        <Link href="/content/new">
          <Button size="md" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Custom Story Generator</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Statistics */}
      <QuickStats
        totalStories={totalStories}
        videosAdded={videosAdded}
        readyToPublish={readyToPublish}
        published={published}
      />

      {/* Saturday 7-Day Production Hub & Auto-Publish Schedule */}
      <WeeklyProductionHub stories={stories} onRefresh={fetchStories} />

      {/* Recent Stories Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-orange-400" />
            <span>Recent Content Library</span>
          </h3>
          <Link
            href="/content"
            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All Stories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stories.slice(0, 6).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
            <p className="text-sm text-slate-400">No stories created yet.</p>
            <Button size="sm" onClick={handleGenerateTodayStory} isLoading={generating}>
              Generate Your First Story
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
