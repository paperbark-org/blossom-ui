"use client";

import { useEffect, useState, useCallback } from "react";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import {
  Settings,
  RefreshCw,
  Loader2,
  Save,
  AlertCircle,
  Check,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type ConfigData = {
  path?: string;
  config?: Record<string, unknown>;
  resolved?: Record<string, unknown>;
};

export default function ConfigPage() {
  const { rpc, isConnected } = useOpenClaw();
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    try {
      const result = await rpc("config.get") as any;
      setConfigData({
        path: result?.path,
        config: result?.config ?? result?.parsed ?? result,
        resolved: result?.resolved,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }, [rpc, isConnected]);

  useEffect(() => {
    if (isConnected) refresh();
  }, [isConnected, refresh]);

  const handleSave = async () => {
    if (!editKey) return;
    setSaving(true);
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(editValue);
      } catch {
        parsed = editValue;
      }
      await rpc("config.set", { key: editKey, value: parsed });
      setSaved(editKey);
      setEditKey(null);
      setTimeout(() => setSaved(null), 2000);
      await refresh();
    } catch (err) {
      console.error("Config save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const config = configData?.config ?? {};
  const sections = Object.keys(config).filter((key) => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (key.toLowerCase().includes(q)) return true;
    return JSON.stringify(config[key] ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuration</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            System settings
            {configData?.path && (
              <span className="ml-2 font-mono text-xs opacity-60">{configData.path}</span>
            )}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search config..."
        className="max-w-md"
      />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading && !configData ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20">
          <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-lg font-medium text-foreground">No config data</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <ConfigSection
              key={section}
              name={section}
              data={config[section]}
              prefix={section}
              editKey={editKey}
              editValue={editValue}
              saving={saving}
              saved={saved}
              onEdit={(key, value) => {
                setEditKey(key);
                setEditValue(typeof value === "string" ? value : JSON.stringify(value, null, 2));
              }}
              onSave={handleSave}
              onCancel={() => setEditKey(null)}
              onEditValueChange={setEditValue}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigSection({
  name,
  data,
  prefix,
  editKey,
  editValue,
  saving,
  saved,
  onEdit,
  onSave,
  onCancel,
  onEditValueChange,
}: {
  name: string;
  data: unknown;
  prefix: string;
  editKey: string | null;
  editValue: string;
  saving: boolean;
  saved: string | null;
  onEdit: (key: string, value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditValueChange: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isObject = data !== null && typeof data === "object" && !Array.isArray(data);
  const entries = isObject ? Object.entries(data as Record<string, unknown>) : [];

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card>
        <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground">
            {isObject ? `${entries.length} keys` : typeof data}
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t">
            {isObject ? (
              entries.map(([key, value]) => {
                const fullKey = `${prefix}.${key}`;
                const isNested = value !== null && typeof value === "object";
                const isEditing = editKey === fullKey;
                const isSaved = saved === fullKey;
                const displayValue = isNested ? JSON.stringify(value, null, 2) : String(value ?? "");
                const isRedacted = displayValue.includes("__OPENCLAW_REDACTED__");

                return (
                  <div key={key} className="px-4 py-2.5 border-t first:border-t-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-mono font-medium text-foreground">{fullKey}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {isSaved && <Check className="h-3.5 w-3.5 text-success" />}
                        {!isEditing && !isRedacted && (
                          <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => onEdit(fullKey, value)}>
                            edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-1.5 space-y-2">
                        <Textarea
                          value={editValue}
                          onChange={(e) => onEditValueChange(e.target.value)}
                          rows={isNested ? Math.min(displayValue.split("\n").length, 10) : 1}
                          className="text-xs font-mono"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={onSave} disabled={saving} className="h-6 text-xs">
                            {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={onCancel} className="h-6 text-xs">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <pre className={`mt-1 text-xs font-mono whitespace-pre-wrap break-all ${isRedacted ? "text-muted-foreground opacity-50" : "text-foreground opacity-80"}`}>
                        {isNested
                          ? displayValue.length > 200 ? displayValue.substring(0, 200) + "..." : displayValue
                          : displayValue}
                      </pre>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3">
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground opacity-80">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
