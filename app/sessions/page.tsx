"use client";

import { useState } from "react";
import { useOpenClawSessions } from "@/hooks/use-openclaw-sessions";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import {
  Folder,
  Trash2,
  RotateCcw,
  RefreshCw,
  Loader2,
  MessageSquare,
  Clock,
  Bot,
  Archive,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SessionSummary } from "@/lib/types";

export default function SessionsPage() {
  const { isConnected } = useOpenClaw();
  const { sessions, loading, error, refresh, deleteSession, resetSession, compactSession } =
    useOpenClawSessions();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.displayName?.toLowerCase().includes(q) ||
      s.key.toLowerCase().includes(q) ||
      s.channel?.toLowerCase().includes(q) ||
      s.origin?.label?.toLowerCase().includes(q)
    );
  });

  const handleAction = async (key: string, action: "delete" | "reset" | "compact") => {
    if (action === "delete" && !confirm("Delete this session and all its messages?")) return;
    setActionLoading(`${key}-${action}`);
    try {
      if (action === "delete") await deleteSession(key);
      else if (action === "reset") await resetSession(key);
      else await compactSession(key);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
          <p className="text-sm mt-1 text-muted-foreground">Browse and manage conversation sessions</p>
        </div>
        <Button variant="ghost" size="icon" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search sessions..."
        className="max-w-md"
      />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading && sessions.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">
            {search ? "No matching sessions" : "No sessions yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((session) => (
            <SessionRow
              key={session.key}
              session={session}
              actionLoading={actionLoading}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({
  session,
  actionLoading,
  onAction,
}: {
  session: SessionSummary;
  actionLoading: string | null;
  onAction: (key: string, action: "delete" | "reset" | "compact") => void;
}) {
  const title = session.displayName || session.key;
  const timeAgo = session.updatedAt ? formatTimeAgo(session.updatedAt) : "";
  const agentId = session.key.split(":")[1] ?? session.agentId;

  return (
    <Card className="flex items-center justify-between px-4 py-3 group hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <h3 className="text-sm font-medium truncate text-foreground">{title}</h3>
          <div className="flex items-center gap-3 mt-0.5">
            {agentId && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Bot className="h-3 w-3" />
                {agentId}
              </span>
            )}
            {session.channel && (
              <Badge variant="outline" className="text-xs">{session.channel}</Badge>
            )}
            {timeAgo && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            )}
            {session.totalTokens != null && (
              <span className="text-xs text-muted-foreground">
                {(session.totalTokens / 1000).toFixed(1)}K tokens
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onAction(session.key, "reset")}
          disabled={actionLoading === `${session.key}-reset`}
          title="Reset"
        >
          {actionLoading === `${session.key}-reset` ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onAction(session.key, "compact")}
          disabled={actionLoading === `${session.key}-compact`}
          title="Compact"
        >
          {actionLoading === `${session.key}-compact` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Archive className="h-3 w-3" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onAction(session.key, "delete")}
          disabled={actionLoading === `${session.key}-delete`}
          title="Delete"
        >
          {actionLoading === `${session.key}-delete` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </Button>
      </div>
    </Card>
  );
}

function formatTimeAgo(ts: number | string): string {
  const date = typeof ts === "number" ? ts : new Date(ts).getTime();
  const now = Date.now();
  const diff = now - date;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
