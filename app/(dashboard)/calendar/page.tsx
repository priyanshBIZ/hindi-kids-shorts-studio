"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { Button } from "@/components/ui/Button";

export default function CalendarPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStories(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-orange-400" />
            <span>Content Publishing Calendar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track daily story generation, video readiness, and social publishing schedules.
          </p>
        </div>

        <Link href="/content/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Schedule New Story</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="h-96 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
      ) : (
        <CalendarGrid stories={stories} />
      )}
    </div>
  );
}
