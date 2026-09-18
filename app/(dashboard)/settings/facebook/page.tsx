"use client";

import Link from "next/link";
import { ArrowLeft, Facebook, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function FacebookSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Facebook className="h-6 w-6 text-blue-500" />
            <span>Facebook Reels & Pages Integration (Phase 3)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta Pages API for direct publishing of video reels.
          </p>
        </div>
      </div>

      <Card className="space-y-4">
        <CardHeader>
          <CardTitle className="text-base">Facebook Connection Status</CardTitle>
          <Badge variant="outline" className="gap-1 text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Phase 3 Staging</span>
          </Badge>
        </CardHeader>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3">
          <p className="leading-relaxed">
            In Phase 1, use the <strong>Metadata Studio</strong> to copy family-friendly Hindi captions and descriptions for Facebook posts.
          </p>
        </div>
      </Card>
    </div>
  );
}
