# KURAITH (黒+Wraith = เงาดำ)

> AI Memory & Skills System — ทำให้ AI agents จำได้ข้าม session + ข้ามเครื่อง

## What is this?

This `omega/` directory is a **local read-cache** of the KURAITH memory server.
The server remains the source of truth. This folder lets agents discover context
by scanning the workspace.

## Structure

```
omega/
├── inbox/              ← Handoffs & messages from other sessions/agents
├── memory/
│   ├── soul/           ← Identity (KURAITH.soul.md)
│   ├── learnings/      ← Patterns, decisions, knowledge (.md per item)
│   └── sessions/       ← Session logs (.md per session)
└── KURAITH.md          ← This file
```

## Knowledge Pipeline

Documents flow through 3 stages:
- **raw** — Everything that comes in (learn, handoff, etc.)
- **refined** — Tagged with concepts, cross-referenced, validated
- **gem** — Confirmed patterns, high-value knowledge

## For AI Agents

If you are an AI agent reading this file:
1. Check `inbox/` for pending handoffs
2. Check `memory/learnings/` for relevant knowledge
3. Use the KURAITH MCP tools to interact with the server
4. Run `kuraith_omega action=sync` to refresh this cache
