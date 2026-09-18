import React from "react";
import { BookOpen, Video, Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function QuickStats({
  totalStories = 0,
  videosAdded = 0,
  readyToPublish = 0,
  published = 0,
}: {
  totalStories?: number;
  videosAdded?: number;
  readyToPublish?: number;
  published?: number;
}) {
  const stats = [
    {
      title: "Total Stories",
      value: totalStories,
      icon: BookOpen,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      title: "Videos Received",
      value: videosAdded,
      icon: Video,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Ready to Publish",
      value: readyToPublish,
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Published",
      value: published,
      icon: Send,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`p-4 ${stat.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">{stat.title}</p>
                <h4 className="text-2xl font-bold text-slate-100 mt-1">{stat.value}</h4>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
