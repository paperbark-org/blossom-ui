"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import {
  RefreshCw,
  Loader2,
  Pause,
  Play,
  Trash2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type LogLevel = "all" | "info" | "warn" | "error";

const LEVEL_COLORS: Record<string, string> = {
  ERROR: "#ef4444",
  WARN: "#eab308",
  INFO: "#3b82f6",
  DEBUG: "#6b7280",
};

export default function LogsPage() {
  const { rpc, isConnected } = useOpenClaw();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  const loadLogs = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const result = await rpc("logs.tail", { lines: 200 });
      setLogs(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  }, [rpc, isConnected]);

  useEffect(() => {
    if (isConnected) loadLogs();
  }, [isConnected, loadLogs]);

  useEffect(() => {
    if (!isConnected || paused) return;
    const interval = setInterval(async () => {
      try {
        const result = await rpc("logs.tail", { lines: 50 });
        if (Array.isArray(result) && result.length > 0) {
          setLogs((prev) => {
            const combined = [...prev, ...result];
            const unique = [...new Set(combined)];
            return unique.slice(-500);
          });
        }
      } catch {
        // Ignore poll errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isConnected, paused, rpc]);

  useEffect(() => {
    if (autoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  const filteredLogs = logs.filter((line) => {
    if (filter && !line.toLowerCase().includes(filter.toLowerCase())) return false;
    if (levelFilter !== "all") {
      if (!line.includes(levelFilter.toUpperCase())) return false;
    }
    return true;
  });

  const downloadLogs = () => {
    const blob = new Blob([filteredLogs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blossom-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Logs</h1>
          <p className="text-xs text-muted-foreground">
            {filteredLogs.length} lines {paused ? "(paused)" : "(live)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LogLevel)}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
              <SelectItem value="warn">Warnings</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter..."
            className="w-40 h-8 text-xs"
          />

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPaused(!paused)} title={paused ? "Resume" : "Pause"}>
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLogs([])} title="Clear">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={downloadLogs} title="Download">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs leading-5 bg-[#0d1117] text-[#c9d1d9]"
      >
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((line, i) => {
            let color = "#c9d1d9";
            for (const [level, c] of Object.entries(LEVEL_COLORS)) {
              if (line.includes(level)) {
                color = c;
                break;
              }
            }
            return (
              <div
                key={i}
                className="hover:bg-white/5 px-2 py-0.5 rounded whitespace-pre-wrap break-all"
                style={{ color }}
              >
                {line}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
