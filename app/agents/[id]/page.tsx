"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import { useOpenClawAgents } from "@/hooks/use-openclaw-agents";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditAgentPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected } = useOpenClaw();
  const { agents, updateAgent, loading } = useOpenClawAgents();

  const agentId = params.id as string;
  const agent = agents.find((a) => a.id === agentId);

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [theme, setTheme] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (agent) {
      setName(agent.identity?.name || agent.name || "");
      setEmoji(agent.identity?.emoji || "");
      setTheme(agent.identity?.theme || "");
    }
  }, [agent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAgent({ id: agentId, identity: { name, emoji, theme } });
      router.push("/agents");
    } catch (err) {
      console.error("Failed to update agent:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !agent) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agent && !loading) {
    return <div className="p-6 text-muted-foreground">Agent not found.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/agents")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Edit Agent</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Emoji</label>
          <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-20 text-center" maxLength={4} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Theme / System Prompt</label>
          <Textarea value={theme} onChange={(e) => setTheme(e.target.value)} rows={6} />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || !isConnected}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
