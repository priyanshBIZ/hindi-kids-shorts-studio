"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, Mic, Film } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface SceneProps {
  sceneNumber: number;
  duration: number;
  visualDescription: string;
  videoPrompt: string;
  narration: string;
}

export function SceneCard({
  scene,
  masterStyle,
}: {
  scene: SceneProps;
  masterStyle?: string;
}) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNarration, setCopiedNarration] = useState(false);

  const fullPrompt = `${masterStyle ? `${masterStyle}\n\n` : ""}SCENE ${scene.sceneNumber}: ${scene.visualDescription}\n\n${scene.videoPrompt}`;

  const copyToClipboard = async (text: string, type: "prompt" | "narration") => {
    await navigator.clipboard.writeText(text);
    if (type === "prompt") {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedNarration(true);
      setTimeout(() => setCopiedNarration(false), 2000);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
            {scene.sceneNumber}
          </span>
          <h4 className="font-semibold text-slate-200 text-sm">
            Scene {scene.sceneNumber}
          </h4>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {scene.duration}s
        </span>
      </div>

      {/* Visual Direction */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-1">
          <Film className="h-3.5 w-3.5" />
          <span>Visual Direction (English)</span>
        </div>
        <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
          {scene.visualDescription}
        </p>
      </div>

      {/* Hindi Narration */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1">
          <div className="flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5" />
            <span>Hindi Voiceover / Narration</span>
          </div>
          <button
            onClick={() => copyToClipboard(scene.narration, "narration")}
            className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
          >
            {copiedNarration ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedNarration ? "Copied" : "Copy Hindi"}</span>
          </button>
        </div>
        <p className="text-sm font-medium text-amber-100 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/30 leading-relaxed">
          {scene.narration}
        </p>
      </div>

      {/* Flow Video Prompt */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-purple-400 mb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Google Flow Video Prompt</span>
          </div>
          <button
            onClick={() => copyToClipboard(fullPrompt, "prompt")}
            className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1"
          >
            {copiedPrompt ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedPrompt ? "Copied" : "Copy Prompt"}</span>
          </button>
        </div>
        <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed max-h-28 overflow-y-auto">
          {scene.videoPrompt}
        </p>
      </div>
    </Card>
  );
}
