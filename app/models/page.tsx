"use client";

import { useState } from "react";
import { useOpenClawModels } from "@/hooks/use-openclaw-models";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import { Cpu, RefreshCw, Loader2, Brain, AlertCircle, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ModelChoice } from "@/lib/types";

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#10a37f",
  anthropic: "#d97706",
  google: "#4285f4",
  groq: "#f97316",
  ollama: "#888",
  mistral: "#ff7000",
  deepseek: "#0ea5e9",
  xai: "#333",
};

export default function ModelsPage() {
  const { isConnected } = useOpenClaw();
  const { models, byProvider, loading, error, refresh } = useOpenClawModels();
  const [showAll, setShowAll] = useState(true);

  const providers = Object.entries(byProvider);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Models</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            {models.length} models from {Object.keys(byProvider).length} providers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
            <Filter className="h-3 w-3 mr-1.5" />
            {showAll ? "All providers" : "Configured only"}
          </Button>
          <Button variant="ghost" size="icon" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading && models.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20">
          <Cpu className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">No models found</p>
        </div>
      ) : (
        providers.map(([provider, providerModels]) => (
          <div key={provider}>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 capitalize text-foreground">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: PROVIDER_COLORS[provider.toLowerCase()] || "#888" }}
              />
              {provider}
              <span className="text-xs font-normal text-muted-foreground">
                ({providerModels.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {providerModels.map((model) => (
                <ModelCard key={`${provider}/${model.id}`} model={model} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ModelCard({ model }: { model: ModelChoice }) {
  const color = PROVIDER_COLORS[model.provider.toLowerCase()] || "#888";

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4" style={{ color }} />
            <h3 className="text-sm font-medium text-foreground">{model.name}</h3>
          </div>
          {model.reasoning && (
            <Badge variant="secondary" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Reasoning
            </Badge>
          )}
        </div>
        <p className="text-xs mt-2 font-mono text-muted-foreground">
          {model.provider}/{model.id}
        </p>
        <div className="flex items-center gap-3 mt-2">
          {model.contextWindow && (
            <p className="text-xs text-muted-foreground">
              Context: {model.contextWindow >= 1000000
                ? `${(model.contextWindow / 1000000).toFixed(1)}M`
                : `${(model.contextWindow / 1000).toFixed(0)}K`}
            </p>
          )}
          {model.input && model.input.length > 0 && (
            <p className="text-xs text-muted-foreground">Input: {model.input.join(", ")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
