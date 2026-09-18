"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Video, FileText, CheckCircle, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PipelineStatus } from "./PipelineStatus";

interface StoryWithDetails {
  id: string;
  title: string;
  concept: string;
  moral: string;
  status: string;
  durationSeconds: number;
  createdAt: string;
  scenes: any[];
  videos?: any[];
  metadata?: any;
}

export function TodayStoryCard({
  story,
  onGenerateNew,
  isGenerating = false,
}: {
  story: StoryWithDetails | null;
  onGenerateNew: () => void;
  isGenerating?: boolean;
}) {
  const hasVideo = Boolean(story?.videos && story.videos.length > 0 && story.videos[0]?.status === "READY");
  const hasMetadata = Boolean(story?.metadata);

  return (
    <Card className="border-orange-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-orange-950/20 relative overflow-hidden">
      {/* Decorative accent glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-orange-400 font-semibold">Today's Content</span>
            <CardTitle className="text-xl text-slate-100">
              {story ? story.title : "No Story Generated Today Yet"}
            </CardTitle>
          </div>
        </div>

        {story && <StatusBadge status={story.status} />}
      </CardHeader>

      {story ? (
        <div className="space-y-4">
          {/* Concept & Moral */}
          <div className="bg-slate-950/60 rounded-lg p-4 border border-slate-800 space-y-2">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Concept:</span>
              <p className="text-sm text-slate-200 mt-0.5">{story.concept}</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 uppercase">Moral Lesson:</span>
              <span className="text-xs text-slate-300 italic">{story.moral}</span>
            </div>
          </div>

          {/* Pipeline Tracker */}
          <PipelineStatus
            status={story.status}
            hasVideo={hasVideo}
            hasMetadata={hasMetadata}
            isPublished={story.status === "PUBLISHED"}
          />

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{story.scenes?.length || 0} Scenes</span>
              <span>•</span>
              <span>{story.durationSeconds}s Duration</span>
              <span>•</span>
              <span>Hindi (4-8 yrs)</span>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/content/${story.id}`}>
                <Button size="md" className="gap-2">
                  <span>Open Story Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center space-y-4">
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Kickstart today's production with an AI-crafted Hindi story, scene breakdowns, narration, and Google Flow prompts.
          </p>
          <Button
            onClick={onGenerateNew}
            isLoading={isGenerating}
            size="lg"
            className="gap-2 font-semibold shadow-lg shadow-orange-500/30"
          >
            <Sparkles className="h-5 w-5" />
            <span>Generate Today's Story</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
