"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, Sparkles, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { Button } from "@/components/ui/Button";

export default function CalendarPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [cleaningStorage, setCleaningStorage] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setStories(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleCreate7DayBatch = async () => {
    setCreatingBatch(true);
    setMsg(null);
    try {
      const res = await fetch("/api/stories/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Batch generation failed");

      setMsg({
        type: "success",
        text: `🎉 ${data.message || "7-Day Weekly Video Plan created & scheduled for daily 10:00 AM publishing!"}`,
      });
      await fetchStories();
    } catch (err: unknown) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create 7-day batch",
      });
    } finally {
      setCreatingBatch(false);
    }
  };

  const handleCleanupStorage = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clean up published video files from Vercel Blob storage?"
    );
    if (!confirmed) return;

    setCleaningStorage(true);
    setMsg(null);
    try {
      const res = await fetch("/api/storage/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Cleanup failed");

      setMsg({
        type: "success",
        text: `🧹 ${data.message}`,
      });
      await fetchStories();
    } catch (err: unknown) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Storage cleanup failed",
      });
    } finally {
      setCleaningStorage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-orange-400" />
            <span>7-Day Content Publishing Calendar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Videos auto-publish daily at 10:00 AM & Vercel Blob storage auto-cleans on publish.</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 7-Day Batch Creator */}
          <Button
            size="sm"
            variant="primary"
            isLoading={creatingBatch}
            onClick={handleCreate7DayBatch}
            className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate 7-Day Weekly Batch</span>
          </Button>

          {/* Storage Cleanup */}
          <Button
            size="sm"
            variant="secondary"
            isLoading={cleaningStorage}
            onClick={handleCleanupStorage}
            className="gap-1.5 border-slate-700 hover:border-slate-500"
            title="Delete published video MP4 files from Vercel Blob storage"
          >
            <Trash2 className="h-4 w-4 text-rose-400" />
            <span>Clear Published Storage</span>
          </Button>

          {/* Single New Story */}
          <Link href="/content/new">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Single Story</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Notification */}
      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            msg.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
      ) : (
        <CalendarGrid stories={stories} />
      )}
    </div>
  );
}
