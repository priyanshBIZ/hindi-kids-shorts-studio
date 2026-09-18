"use client";

import { useEffect, useState } from "react";
import { BarChart3, Coins, Cpu, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils/formatting";

export default function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-orange-400" />
            <span>AI Token & Consumption Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of Gemini model calls, token consumption, and estimated costs per video.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchAnalytics} isLoading={loading} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-sky-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total AI Tokens Used</p>
              <h4 className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                {data?.summary?.totalTokens?.toLocaleString() || 0}
              </h4>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Estimated Total AI Cost</p>
              <h4 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                ${data?.summary?.totalCost || "0.0000"}
              </h4>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Coins className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Stories Produced</p>
              <h4 className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                {data?.summary?.totalStories || 0}
              </h4>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent API Call Logs Table */}
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle className="text-base">Recent AI & Service Call Logs</CardTitle>
          <span className="text-xs text-slate-400">Showing last 20 requests</span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Service</th>
                <th className="p-3">Request Type</th>
                <th className="p-3">Model</th>
                <th className="p-3">Tokens</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Status</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {data?.recentLogs && data.recentLogs.length > 0 ? (
                data.recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-200">{log.service}</td>
                    <td className="p-3 text-slate-300">{log.requestType}</td>
                    <td className="p-3 text-slate-400">{log.model || "default"}</td>
                    <td className="p-3">{log.tokensUsed?.toLocaleString() || 0}</td>
                    <td className="p-3 text-emerald-400">${log.estimatedCost?.toFixed(6) || 0}</td>
                    <td className="p-3">
                      {log.success ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> OK
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1" title={log.errorMessage}>
                          <XCircle className="h-3 w-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                    No API request logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
