"use client";

import Link from "next/link";
import { ArrowLeft, Layers, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function FlowSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="h-6 w-6 text-orange-400" />
            <span>Google Flow & Video Generation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure video rendering mode (Manual Flow vs Future UseAPI).
          </p>
        </div>
      </div>

      <Card className="space-y-4">
        <CardHeader>
          <CardTitle className="text-base">Active Video Provider</CardTitle>
          <Badge variant="warning">Manual Mode (V1)</Badge>
        </CardHeader>

        <div className="space-y-3 text-xs">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Mode: Manual Google Flow Prompt Checkpoint
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Active</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              In Phase 1, you copy the generated scene prompts into Google Flow directly and paste the resulting YouTube Short URL or upload the MP4. No API credits or automation credentials are used.
            </p>
          </div>

          <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-800 space-y-2 opacity-75">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Mode: UseAPI Automated Video Rendering (Phase 4)</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Phase 4</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              When configured in Phase 4, the studio will automatically send scene prompts to Google Flow via UseAPI and fetch rendered videos directly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
