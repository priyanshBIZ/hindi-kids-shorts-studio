"use client";

import Link from "next/link";
import { ArrowLeft, Cpu, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AISettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-orange-400" />
            <span>Gemini AI Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage Gemini models, story generation parameters, and TTS settings.
          </p>
        </div>
      </div>

      <Card className="space-y-4">
        <CardHeader>
          <CardTitle className="text-base">Configured AI Providers</CardTitle>
          <Badge variant="success">Production Ready</Badge>
        </CardHeader>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200">Story & Script Model</span>
            <p className="text-slate-400 font-mono"><code>GEMINI_MODEL=gemini-2.5-flash</code></p>
            <p className="text-[11px] text-slate-500">Fast, low-latency multimodal reasoning model with strict JSON schema enforcement.</p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200">Hindi TTS Model</span>
            <p className="text-slate-400 font-mono"><code>GEMINI_TTS_MODEL=gemini-2.5-flash-tts</code></p>
            <p className="text-[11px] text-slate-500">Natural cadence voiceover generation for kids narration.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
