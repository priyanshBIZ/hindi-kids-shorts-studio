"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, Video, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface CalendarStory {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export function CalendarGrid({ stories }: { stories: CalendarStory[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group stories by day of the current month
  const storiesByDay: { [day: number]: CalendarStory[] } = {};
  stories.forEach((story) => {
    const d = new Date(story.createdAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!storiesByDay[day]) storiesByDay[day] = [];
      storiesByDay[day].push(story);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "READY_TO_PUBLISH":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "VIDEO_ADDED":
      case "VIDEO_PENDING":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "FAILED":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      default:
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
    }
  };

  return (
    <Card className="space-y-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-orange-400" />
          <CardTitle>{monthNames[month]} {year}</CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button size="sm" variant="outline" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 py-2 border-b border-slate-800">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before month start */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[90px] rounded-lg bg-slate-950/20 border border-slate-900/50 p-1.5 opacity-30" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayStories = storiesByDay[day] || [];
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={`day-${day}`}
              className={`min-h-[95px] rounded-lg p-2 border transition-all flex flex-col justify-between ${
                isToday
                  ? "bg-orange-500/5 border-orange-500/40"
                  : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isToday ? "text-orange-400" : "text-slate-400"}`}>
                  {day}
                </span>
                {isToday && (
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1 rounded">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[65px]">
                {dayStories.map((s) => (
                  <Link
                    key={s.id}
                    href={`/content/${s.id}`}
                    className={`block text-[11px] p-1 rounded border leading-tight truncate transition-transform hover:scale-[1.02] ${getStatusColor(
                      s.status
                    )}`}
                    title={s.title}
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Published
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-400" /> Ready to Publish
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Video Pending
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Story / Prompts Ready
        </span>
      </div>
    </Card>
  );
}
