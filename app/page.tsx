"use client";

import { useEffect, useState } from "react";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import {
  Activity,
  Bot,
  Clock,
  Cpu,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HealthStatus, ModelChoice } from "@/lib/types";

export default function OverviewPage() {
  const { isConnected, state, hello, snapshot, rpc, subscribe } = useOpenClaw();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [agentCount, setAgentCount] = useState(0);
  const [modelCount, setModelCount] = useState(0);

  useEffect(() => {
    if (!isConnected) return;
    Promise.allSettled([
      rpc("health").then((r: any) => setHealth(r)),
      rpc("models.list").then((r: any) => {
        const models = r?.models ?? r;
        setModelCount(Array.isArray(models) ? models.length : 0);
      }),
      rpc("agents.list").then((r: any) => setAgentCount(r?.agents?.length ?? 0)),
    ]);
  }, [isConnected, rpc]);

  useEffect(() => {
    if (!isConnected) return;
    return subscribe("health", (payload) => {
      if (payload && typeof payload === "object") setHealth(payload as HealthStatus);
    });
  }, [isConnected, subscribe]);

  const uptime = snapshot?.uptimeMs ? formatUptime(snapshot.uptimeMs) : "\u2014";
  const serverVersion = hello?.server?.version ?? "\u2014";
  const connectedClients = snapshot?.presence?.length ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blossom Gateway</h1>
          <p className="text-sm mt-1 text-muted-foreground">AI Gateway Control Panel</p>
        </div>
        <Badge
          variant={isConnected ? "default" : "destructive"}
          className="flex items-center gap-1.5"
        >
          {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {state === "connected"
            ? "Connected"
            : state === "connecting"
              ? "Connecting..."
              : state === "authenticating"
                ? "Authenticating..."
                : "Disconnected"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          icon={<Activity className="h-5 w-5" />}
          label="Health"
          value={health?.ok ? "Healthy" : health === null ? "\u2014" : "Unhealthy"}
          color={health?.ok ? "text-success" : "text-destructive"}
        />
        <StatusCard icon={<Clock className="h-5 w-5" />} label="Uptime" value={uptime} />
        <StatusCard icon={<Cpu className="h-5 w-5" />} label="Version" value={serverVersion} />
        <StatusCard icon={<Wifi className="h-5 w-5" />} label="Clients" value={String(connectedClients)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResourceCard icon={<Bot className="h-5 w-5" />} label="Agents" count={agentCount} href="/agents" />
        <ResourceCard icon={<Cpu className="h-5 w-5" />} label="Models" count={modelCount} href="/models" />
        <ResourceCard icon={<Zap className="h-5 w-5" />} label="Skills" count={0} href="/skills" />
      </div>

      {snapshot?.presence && snapshot.presence.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">Connected Clients</h2>
            <div className="space-y-2">
              {snapshot.presence.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm text-foreground">
                      {p.host || p.platform || "Unknown"}
                    </span>
                    {p.mode && <Badge variant="outline" className="text-xs">{p.mode}</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{p.version ?? ""}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="rounded-lg bg-muted p-2">
          <span className={color ?? "text-muted-foreground"}>{icon}</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ResourceCard({
  icon,
  label,
  count,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
}) {
  return (
    <a href={href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">{icon}</div>
          <div>
            <p className="text-2xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}
