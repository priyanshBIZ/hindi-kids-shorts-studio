"use client";

import React, { useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ApiStatusItem } from "@/types/api";

export function ApiStatusCard({
  statusItem,
  onRefresh,
}: {
  statusItem: ApiStatusItem;
  onRefresh: () => void;
}) {
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    await onRefresh();
    setTesting(false);
  };

  const getStatusDisplay = () => {
    switch (statusItem.status) {
      case "CONNECTED":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Connected</span>
          </Badge>
        );
      case "MANUAL":
        return (
          <Badge variant="warning" className="gap-1">
            <Layers className="h-3 w-3" />
            <span>Manual Flow (Active)</span>
          </Badge>
        );
      case "ERROR":
        return (
          <Badge variant="danger" className="gap-1">
            <XCircle className="h-3 w-3" />
            <span>Connection Error</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-slate-400">
            <AlertTriangle className="h-3 w-3 text-slate-500" />
            <span>Not Configured</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between space-y-4 border-slate-800 bg-slate-900/60">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-slate-100 text-sm">{statusItem.name}</h4>
            {statusItem.model && (
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                Model: {statusItem.model}
              </p>
            )}
          </div>
          {getStatusDisplay()}
        </div>

        {statusItem.details && (
          <p className="text-xs text-slate-300 mt-3 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
            {statusItem.details}
          </p>
        )}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
        <span className="text-[11px] text-slate-500 font-mono">Service: {statusItem.service}</span>

        {statusItem.canTest && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleTest}
            isLoading={testing}
            className="text-xs gap-1 py-1 px-2.5 h-7"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Test Connection</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
