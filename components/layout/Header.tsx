"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [apiReady, setApiReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setApiReady(data?.data?.gemini?.status === "CONNECTED");
      })
      .catch(() => setApiReady(false));
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-slate-100">
          Studio Dashboard
        </h2>
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-300">Phase 1 Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Gemini status badge */}
        <Link href="/settings" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors">
          <Activity className="h-3.5 w-3.5 text-orange-400" />
          <span>Gemini AI:</span>
          {apiReady === true ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Connected
            </span>
          ) : apiReady === false ? (
            <span className="text-amber-400 font-medium">Needs Key</span>
          ) : (
            <span className="text-slate-500">Checking...</span>
          )}
        </Link>

        {/* Quick New Story button */}
        <Link href="/content/new">
          <Button size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Story</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
