import React from "react";
import Link from "next/link";
import { ArrowRight, Video, FileText, Calendar, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatting";

export interface StorySummary {
  id: string;
  title: string;
  concept: string;
  moral: string;
  status: string;
  durationSeconds: number;
  createdAt: string | Date;
  scenes?: any[];
  videos?: any[];
  metadata?: any;
}

export function StoryCard({ story }: { story: StorySummary }) {
  const hasVideo = Boolean(story.videos && story.videos.length > 0 && story.videos[0]?.status === "READY");
  const hasMetadata = Boolean(story.metadata);

  return (
    <Card className="hover:border-slate-700 transition-all group flex flex-col justify-between p-5">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status={story.status} />
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(story.createdAt)}
          </span>
        </div>

        <div>
          <h4 className="font-semibold text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-1">
            {story.title}
          </h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {story.concept}
          </p>
        </div>

        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-amber-400">Moral:</span>
          <p className="text-xs text-slate-300 italic line-clamp-1 mt-0.5">{story.moral}</p>
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-sky-400" />
            {story.scenes?.length || 0} scenes
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Video className={`h-3 w-3 ${hasVideo ? "text-emerald-400" : "text-slate-600"}`} />
            {hasVideo ? "Video Ready" : "Pending"}
          </span>
        </div>

        <Link
          href={`/content/${story.id}`}
          className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
        >
          <span>Studio</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}
