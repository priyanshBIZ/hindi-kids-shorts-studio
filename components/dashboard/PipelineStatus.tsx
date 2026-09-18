import React from "react";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface PipelineStep {
  name: string;
  isComplete: boolean;
  isCurrent?: boolean;
  isFailed?: boolean;
}

export function PipelineStatus({
  status,
  hasVideo = false,
  hasMetadata = false,
  isPublished = false,
}: {
  status: string;
  hasVideo?: boolean;
  hasMetadata?: boolean;
  isPublished?: boolean;
}) {
  const steps: PipelineStep[] = [
    {
      name: "Story Generated",
      isComplete: ["STORY_GENERATED", "PROMPTS_READY", "VIDEO_PENDING", "VIDEO_ADDED", "READY_TO_PUBLISH", "PUBLISHED"].includes(status),
    },
    {
      name: "Prompts Ready",
      isComplete: ["PROMPTS_READY", "VIDEO_PENDING", "VIDEO_ADDED", "READY_TO_PUBLISH", "PUBLISHED"].includes(status),
    },
    {
      name: "Video Checkpoint",
      isComplete: hasVideo || ["VIDEO_ADDED", "READY_TO_PUBLISH", "PUBLISHED"].includes(status),
      isCurrent: status === "VIDEO_PENDING" || status === "PROMPTS_READY",
    },
    {
      name: "Social Metadata",
      isComplete: hasMetadata || ["READY_TO_PUBLISH", "PUBLISHED"].includes(status),
    },
    {
      name: "Published",
      isComplete: isPublished || status === "PUBLISHED",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-4">
      {steps.map((step, idx) => (
        <div
          key={step.name}
          className={cn(
            "p-3 rounded-lg border flex flex-col gap-1.5 transition-all",
            step.isComplete
              ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
              : step.isCurrent
              ? "bg-amber-950/30 border-amber-800/60 text-amber-300 shadow-sm shadow-amber-500/10"
              : "bg-slate-900/40 border-slate-800/60 text-slate-400"
          )}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400">0{idx + 1}</span>
            {step.isComplete ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : step.isCurrent ? (
              <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
            ) : (
              <Circle className="h-4 w-4 text-slate-600" />
            )}
          </div>
          <p className="text-xs font-medium leading-tight text-slate-200">{step.name}</p>
        </div>
      ))}
    </div>
  );
}
