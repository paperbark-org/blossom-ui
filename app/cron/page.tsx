"use client";

import { useEffect, useState } from "react";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import {
  Timer,
  RefreshCw,
  Loader2,
  Play,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CronJob } from "@/lib/types";

export default function CronPage() {
  const { rpc, isConnected, subscribe } = useOpenClaw();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const refresh = async () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    try {
      const result = await rpc("cron.list");
      setJobs(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cron jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) refresh();
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;
    return subscribe("cron", () => refresh());
  }, [isConnected, subscribe]);

  const handleRun = async (id: string) => {
    setRunningJob(id);
    try {
      await rpc("cron.run", { id });
      await refresh();
    } catch (err) {
      console.error("Cron run failed:", err);
    } finally {
      setRunningJob(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this cron job?")) return;
    try {
      await rpc("cron.remove", { id });
      await refresh();
    } catch (err) {
      console.error("Cron delete failed:", err);
    }
  };

  const handleToggle = async (job: CronJob) => {
    try {
      await rpc("cron.update", { id: job.id, enabled: !job.enabled });
      await refresh();
    } catch (err) {
      console.error("Cron toggle failed:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cron Jobs</h1>
          <p className="text-sm mt-1 text-muted-foreground">Scheduled tasks and recurring commands</p>
        </div>
        <Button variant="ghost" size="icon" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading && jobs.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <Timer className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">No cron jobs</p>
          <p className="text-sm mt-1 text-muted-foreground">Add cron jobs via the OpenClaw CLI</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Card key={job.id} className="flex items-center justify-between px-4 py-3 group">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${job.enabled ? "text-success" : "text-muted-foreground"}`}
                  onClick={() => handleToggle(job)}
                  title={job.enabled ? "Disable" : "Enable"}
                >
                  {job.enabled ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </Button>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium truncate text-foreground">{job.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <Badge variant="outline" className="text-xs font-mono">{job.expression}</Badge>
                    <span className="text-xs truncate text-muted-foreground">{job.command}</span>
                  </div>
                  {job.nextRun && (
                    <p className="flex items-center gap-1 text-xs mt-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Next: {new Date(job.nextRun).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRun(job.id)}
                  disabled={runningJob === job.id}
                  title="Run now"
                >
                  {runningJob === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(job.id)}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
