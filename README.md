# Blossom UI

Branded control panel for the [OpenClaw](https://github.com/openclaw/openclaw) AI gateway, built by [Paperbark](https://github.com/paperbark-org).

## Pages

| Page | Description |
|------|-------------|
| **Overview** | Gateway health, agent summary, system resources |
| **Chat** | Real-time streaming chat with agents |
| **Agents** | Create, edit, and manage AI agents |
| **Sessions** | Browse and manage conversation sessions |
| **Models** | View available LLM models by provider |
| **Skills** | Browse skills with eligibility status |
| **Cron** | Scheduled job management |
| **Config** | Live config editor |
| **Logs** | Real-time log streaming |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [OpenClaw](https://github.com/openclaw/openclaw) gateway running (`openclaw gateway start`)

### Setup

```bash
git clone https://github.com/paperbark-org/blossom-ui.git
cd blossom-ui
npm install

# Configure gateway connection
cp .env.example .env.local
# Edit .env.local with your gateway URL and token

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the dashboard auto-connects to your OpenClaw gateway.

### Environment Variables

```
NEXT_PUBLIC_OPENCLAW_GATEWAY_URL=ws://localhost:18789
NEXT_PUBLIC_OPENCLAW_GATEWAY_TOKEN=your-token-here
```

You may need to allow the dashboard origin in your `openclaw.json`:

```json
{
  "gateway": {
    "controlUi": {
      "allowedOrigins": ["http://localhost:3000"],
      "allowInsecureAuth": true
    }
  }
}
```

## Architecture

```
blossom-ui/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Overview (health, agents, resources)
│   ├── chat/page.tsx       # Streaming chat interface
│   ├── agents/page.tsx     # Agent list
│   ├── agents/new/page.tsx # Create agent
│   ├── agents/[id]/page.tsx# Edit agent
│   ├── sessions/page.tsx   # Session browser
│   ├── models/page.tsx     # Model catalog
│   ├── skills/page.tsx     # Skills status
│   ├── cron/page.tsx       # Cron scheduler
│   ├── config/page.tsx     # Config editor
│   └── logs/page.tsx       # Log viewer
├── lib/
│   ├── gateway-client.ts   # WebSocket client (challenge-nonce auth, auto-reconnect)
│   ├── types.ts            # Full wire protocol types (80+ RPC methods, 17 events)
│   └── utils.ts            # Tailwind cn() helper
├── hooks/
│   ├── use-openclaw-gateway.ts   # Gateway connection
│   ├── use-openclaw-chat.ts      # Chat with streaming
│   ├── use-openclaw-agents.ts    # Agent CRUD
│   ├── use-openclaw-models.ts    # Model listing
│   └── use-openclaw-sessions.ts  # Session management
├── contexts/
│   └── OpenClawContext.tsx  # Shared gateway connection
└── components/
    ├── Sidebar.tsx          # Navigation with connection status
    └── ui/                  # shadcn/ui components
```

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **shadcn/ui** + Radix UI primitives
- **Lucide React** for icons

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

## License

MIT
