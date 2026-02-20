"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import { useOpenClawAgents } from "@/hooks/use-openclaw-agents";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewAgentPage() {
  const router = useRouter();
  const { isConnected } = useOpenClaw();
  const { createAgent } = useOpenClawAgents();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("\uD83E\uDD16");
  const [theme, setTheme] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createAgent({ name, identity: { name, emoji, theme } });
      router.push("/agents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/agents")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">New Agent</h1>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Agent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Emoji</label>
          <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-20 text-center" maxLength={4} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Theme / System Prompt</label>
          <Textarea value={theme} onChange={(e) => setTheme(e.target.value)} rows={6} placeholder="You are a helpful assistant..." />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreate} disabled={saving || !isConnected}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Create Agent
          </Button>
        </div>
      </div>
    </div>
  );
}
