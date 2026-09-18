import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-200 border border-slate-700",
    success: "bg-emerald-950 text-emerald-300 border border-emerald-800/60",
    warning: "bg-amber-950 text-amber-300 border border-amber-800/60",
    danger: "bg-rose-950 text-rose-300 border border-rose-800/60",
    info: "bg-sky-950 text-sky-300 border border-sky-800/60",
    purple: "bg-purple-950 text-purple-300 border border-purple-800/60",
    outline: "bg-transparent text-slate-300 border border-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PUBLISHED":
      return <Badge variant="success">● Published</Badge>;
    case "READY_TO_PUBLISH":
      return <Badge variant="purple">● Ready to Publish</Badge>;
    case "VIDEO_ADDED":
      return <Badge variant="info">● Video Received</Badge>;
    case "VIDEO_PENDING":
      return <Badge variant="warning">○ Video Pending</Badge>;
    case "PROMPTS_READY":
      return <Badge variant="info">● Prompts Ready</Badge>;
    case "STORY_GENERATED":
      return <Badge variant="info">● Story Ready</Badge>;
    case "IDEA":
      return <Badge variant="outline">○ Idea</Badge>;
    case "FAILED":
      return <Badge variant="danger">● Failed</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}
