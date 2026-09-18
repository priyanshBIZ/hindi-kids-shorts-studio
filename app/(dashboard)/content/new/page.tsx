"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft, Lightbulb, Wand2, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NewStoryPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [moral, setMoral] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetIdeas = [
    {
      title: "गज्जू और नन्ही चिड़िया",
      theme: "Baby elephant helping a fallen baby sparrow get back to its nest.",
      character: "Gajju the baby elephant",
      moral: "Helping others brings true happiness",
    },
    {
      title: "चीकू और जादुई अखरोट",
      theme: "Clever squirrel finding a huge walnut and sharing with forest friends.",
      character: "Chiku the playful squirrel",
      moral: "Sharing multiplies your joy",
    },
    {
      title: "मीनू चिड़िया का नया घोंसला",
      theme: "Little bird braving the wind with the help of friendly bear Golu.",
      character: "Meenu the sparrow & Golu bear",
      moral: "Teamwork makes any difficult task easy",
    },
  ];

  const handleApplyPreset = (preset: typeof presetIdeas[0]) => {
    setTheme(preset.theme);
    setCharacterName(preset.character);
    setMoral(preset.moral);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: theme || undefined,
          characterName: characterName || undefined,
          moral: moral || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Story generation failed");
      }

      router.push(`/content/${data.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate story");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/content" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-orange-400" />
            <span>Create New Hindi Children's Story</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Craft an original 30-second animated short with structured scenes, Hindi voiceover, and Google Flow prompts.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset Inspirations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
          <span>Quick Inspiration Presets</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presetIdeas.map((preset) => (
            <div
              key={preset.title}
              onClick={() => handleApplyPreset(preset)}
              className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 cursor-pointer transition-all space-y-1 group"
            >
              <h4 className="font-semibold text-xs text-slate-200 group-hover:text-orange-400">
                {preset.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {preset.theme}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Form */}
      <Card className="border-orange-500/30">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
              Story Theme or Core Idea (Optional)
            </label>
            <textarea
              rows={3}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. A baby peacock who is shy about showing its colorful feathers until it helps guide lost forest friends home..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Leave blank to automatically synthesize an original trending daily theme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                Main Character Name / Description
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g. Gajju the baby elephant"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                Moral Lesson / Educational Value
              </label>
              <input
                type="text"
                value={moral}
                onChange={(e) => setMoral(e.target.value)}
                placeholder="e.g. Helping others, sharing, kindness, honesty"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Child Safety Guardrail Notice */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Indian Child Safety System Prompt Active:</strong> Generation is strictly constrained to positive, gentle, non-violent Hindi storytelling suitable for children aged 4-8.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              size="lg"
              isLoading={generating}
              className="gap-2 font-semibold shadow-lg shadow-orange-500/20"
            >
              <Sparkles className="h-5 w-5" />
              <span>{generating ? "Synthesizing Story & Prompts..." : "Generate Production Package"}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
