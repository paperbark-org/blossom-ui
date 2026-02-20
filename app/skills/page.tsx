"use client";

import { useEffect, useState } from "react";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import {
  Zap,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SkillInfo } from "@/lib/types";

export default function SkillsPage() {
  const { rpc, isConnected } = useOpenClaw();
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ready" | "missing">("all");

  const refresh = async () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    try {
      const result = await rpc("skills.status") as any;
      const skillList = result?.skills ?? result;
      setSkills(Array.isArray(skillList) ? skillList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) refresh();
  }, [isConnected]);

  const isReady = (s: SkillInfo) =>
    s.eligible === true && !s.disabled && (!s.missing?.bins?.length);

  const filtered = skills.filter((s) => {
    if (filter === "ready" && !isReady(s)) return false;
    if (filter === "missing" && isReady(s)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
  });

  const readyCount = skills.filter(isReady).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            {readyCount} of {skills.length} skills ready
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="flex-1 max-w-md"
        />
        <div className="flex rounded-lg border overflow-hidden">
          {(["all", "ready", "missing"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              size="sm"
              className="rounded-none text-xs capitalize h-9"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading && skills.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((skill) => {
            const ready = isReady(skill);
            const missingBins = skill.missing?.bins ?? [];

            return (
              <Card key={skill.skillKey || skill.name} className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{skill.emoji || "\uD83E\uDDE9"}</span>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{skill.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{skill.source ?? "unknown"}</p>
                      </div>
                    </div>
                    {ready ? (
                      <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  {skill.description && (
                    <p className="text-xs mt-2 line-clamp-2 text-muted-foreground">{skill.description}</p>
                  )}
                  {missingBins.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] mb-1 text-muted-foreground">Missing:</p>
                      <div className="flex flex-wrap gap-1">
                        {missingBins.map((bin) => (
                          <Badge key={bin} variant="destructive" className="text-[10px] font-mono">
                            {bin}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
