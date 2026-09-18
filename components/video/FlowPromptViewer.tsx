"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, Layers, FileCode, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SceneCard } from "@/components/content/SceneCard";
import { FlowPromptPackage } from "@/types/video";

export function FlowPromptViewer({
  flowPackage,
}: {
  flowPackage: FlowPromptPackage;
}) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPackage, setCopiedPackage] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState(false);

  const handleCopyAllPrompts = async () => {
    const fullText = flowPackage.scenes
      .map(
        (s) =>
          `=== SCENE ${s.sceneNumber} (${s.duration}s) ===\n${s.videoPrompt}\n\nVoiceover: ${s.narration}`
      )
      .join("\n\n---------------------------------\n\n");

    await navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyCompletePackage = async () => {
    const fullPackageText = `STORY TITLE: ${flowPackage.storyTitle}
MASTER 3D STYLE:
${flowPackage.masterStyle}

CHARACTER CONSISTENCY:
${flowPackage.characterConsistency}

===========================================
SCENE-BY-SCENE PRODUCTION BREAKDOWN
===========================================
${flowPackage.scenes
  .map(
    (s) => `
SCENE ${s.sceneNumber} [${s.duration} seconds]
Visual Direction: ${s.visualDescription}
Hindi Narration: ${s.narration}
Google Flow Prompt:
${s.videoPrompt}
`
  )
  .join("\n-------------------------------------------\n")}
`;

    await navigator.clipboard.writeText(fullPackageText);
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2000);
  };

  const handleCopyMasterStyle = async () => {
    await navigator.clipboard.writeText(flowPackage.masterStyle);
    setCopiedStyle(true);
    setTimeout(() => setCopiedStyle(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <Card className="p-4 bg-slate-900 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              Google Flow / Veo Prompts
            </h4>
            <p className="text-xs text-slate-400">
              {flowPackage.scenes.length} scenes • 9:16 Vertical • 3D Animation
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMasterStyle}
            className="text-xs gap-1.5"
          >
            {copiedStyle ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedStyle ? "Copied Style" : "Copy Master Style"}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyAllPrompts}
            className="text-xs gap-1.5"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedAll ? "Copied All Prompts" : "Copy All Prompts"}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCopyCompletePackage}
            className="text-xs gap-1.5 font-semibold"
          >
            {copiedPackage ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : <FileCode className="h-3.5 w-3.5" />}
            <span>{copiedPackage ? "Package Copied!" : "Copy Full Production Package"}</span>
          </Button>
        </div>
      </Card>

      {/* Master Visual Style Info Card */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Master 3D Children's Animation Visual Style
          </span>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
            Vertical 9:16
          </span>
        </div>
        <p className="text-xs text-slate-300 font-mono bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
          {flowPackage.masterStyle}
        </p>
      </div>

      {/* Scene Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flowPackage.scenes.map((scene) => (
          <SceneCard
            key={scene.sceneNumber}
            scene={scene}
            masterStyle={flowPackage.masterStyle}
          />
        ))}
      </div>
    </div>
  );
}
