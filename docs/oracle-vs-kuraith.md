# Oracle vs KURAITH — Full Comparison (March 2026)

> อัพเดตล่าสุดหลัง Priority 1 เสร็จ — 17 agents, 15 skills, Mission Control

---

## ภาพรวม

| | **Oracle** | **KURAITH** |
|---|-----------|------------|
| **ชื่อเต็ม** | Oracle External Brain | KURAITH (黒+Wraith = เงาดำ) |
| **สร้างโดย** | Nat Weerawan (@nazt), Soul-Brews-Studio | Por (@ROYALCLUB-CM) |
| **แนวคิด** | "สมองภายนอก" — The Oracle Keeps the Human Human | "เงาที่ไม่เคยลืม" — AI Memory & Skills |
| **Architecture** | Local-first (ψ/ folder + GitHub sync) | Server-first (PostgreSQL + API) |
| **Runtime** | Bun | Node.js 22 |
| **License** | MIT (open source) | ISC |
| **ชุมชน** | 190 Oracles, 113 users, 21K+ docs | Single-instance (ยังไม่ launch) |

---

## 1. Agents & Skills

| | **Oracle** | **KURAITH** |
|---|-----------|------------|
| **Agents รองรับ** | **17** — Claude, Codex, Cursor, Gemini, Amp, Roo, Windsurf, Zed, Goose, Kilo, Cline, Aider, Continue, OpenCode, Copilot, Antigravity, OpenClaw | **17** — Claude, Codex, Gemini, Zed, Cursor, Roo, Amp, Windsurf, Goose, Kilo, Cline, Aider, Continue, OpenCode, Copilot, Antigravity, OpenClaw |
| **Skills** | **30** (4 subagent + 10 code + 16 markdown) | **15** — recap, learn, rrr, forward, standup, trace, who-are-you, feel, philosophy, speak, awaken, dig, deep-research, watch, birth |
| **Profiles** | 3 — seed (6), standard (13), full (30) | 3 — seed (7), standard (11), full (15) |
| **Installer** | `curl \| bash` (pre-built binary, 37ms startup) | `bash install.sh` (shell script) |
| **Auto-detect agents** | ✅ | ✅ |

**วิเคราะห์**: Agents เท่ากัน (17 vs 17). Oracle ยังนำด้าน skills (30 vs 15) แต่ KURAITH ครอบคลุม skills หลักทั้งหมดที่ใช้งานบ่อย

---

## 2. MCP Tools

| | **Oracle** | **KURAITH** |
|---|-----------|------------|
| **จำนวน Tools** | ~5-6 | **12** |
| **รายการ** | search, learn, trace, + others | search, learn, handoff, inbox, reflect, stats, trace, supersede, refine, omega, workflow, coordinate |
| **Transport** | MCP (oracle-v2 server) | Streamable HTTP (port 47701) |
| **Workflow tools** | ❌ (ใช้ MAW Kit แยก) | ✅ built-in (workflow + coordinate) |
| **Pipeline tool** | ❌ | ✅ kuraith_refine |
| **Local sync tool** | ❌ | ✅ kuraith_omega |

**วิเคราะห์**: KURAITH มี MCP tools มากกว่า (12 vs ~6) และรวม multi-agent workflow ไว้ใน MCP server เลย

---

## 3. Data & Storage

| | **Oracle** | **KURAITH** |
|---|-----------|------------|
| **Storage** | Local filesystem (ψ/ folder) | PostgreSQL 16 + pgvector |
| **Sync** | GitHub (git push/pull) | Server API (always synced) |
| **Cross-device** | ต้อง git sync เอง | ✅ อัตโนมัติ (server-based) |
| **Vector Search** | ❌ | ✅ pgvector + OpenAI embeddings |
| **Keyword Search** | MCP search (text match) | ILIKE + full-text |
| **Hybrid Search** | ❌ | ✅ keyword + vector (ถ้ามี OPENAI_API_KEY) |
| **Data format** | Markdown files (.md) | Structured DB (14 tables) |
| **Backup** | Git history | pg_dump script (auto 7-day retention) |
| **Append-only** | ✅ (nothing deleted) | ✅ (supersede = archive, not delete) |

**วิเคราะห์**: KURAITH เหนือกว่าด้าน data infrastructure — database จริง, vector search, cross-device อัตโนมัติ. Oracle ได้เปรียบด้าน simplicity (แค่ markdown files)

---

## 4. Knowledge Pipeline

| | **Oracle** | **KURAITH** |
|---|-----------|------------|
| **Pipeline** | สำหรอ (raw) → สิ่งแร่ (refined) → อัญมณี (gem) | raw → refined → gem |
| **Promotion tool** | ❌ (manual) | ✅ kuraith_refine (MCP tool) |
| **Stage filtering** | ❌ | ✅ (search, documents, API) |
| **Dashboard view** | ❌ | ✅ Pipeline page (Kanban 3-column) |
| **Stats breakdown** | ❌ | ✅ pipeline stats ใน dashboard |

**วิเคราะห์**: แนวคิดเดียวกัน แต่ KURAITH implement เป็น tooling จริง (MCP tool, filter, dashboard)

---

## 5. Local Structure (ψ vs Ω)

| | **Oracle (ψ)** | **KURAITH (omega)** |
|---|-----------|------------|
| **Folder** | `ψ/` (psi) | `omega/` |
| **Structure** | inbox/, memory/resonance/, memory/learnings/, memory/retrospectives/ | inbox/, memory/soul/, memory/learnings/, memory/sessions/ |
| **Main file** | CLAUDE.md | KURAITH.md |
| **Soul/Identity** | resonance/ | soul/KURAITH.soul.md |
| **Source of truth** | Local files (ψ/ = primary) | Server (omega/ = read-cache) |
| **Sync** | Git → remote | Server → local (kuraith_omega sync) |
| **MCP tool** | ❌ | ✅ kuraith_omega (init/sync/status) |

**วิเคราะห์**: โครงสร้างคล้ายกัน ต่างตรง source of truth — Oracle = local-first, KURAITH = server-first

---

## 6. Multi-Agent Workflow

| | **Oracle (MAW Kit)** | **KURAITH** |
|---|-----------|------------|
| **Architecture** | Standalone CLI (shell + python) | Built-in MCP tools |
| **Workspace** | Git worktree per agent | Server-coordinated tasks |
| **UI** | tmux split panes | Dashboard (Workflows page) |
| **Branch mgmt** | ✅ auto-create branches | ✅ branch field per task |
| **Broadcasting** | `maw hey` broadcast all | kuraith_coordinate broadcast |
| **Agent-to-agent** | maw sync between branches | kuraith_coordinate messages |
| **Task tracking** | ❌ (manual) | ✅ status (pending/in_progress/completed/failed) |
| **Progress** | ❌ | ✅ progress bars + dashboard |

**วิเคราะห์**: Oracle MAW ดีกว่าด้าน workspace isolation (git worktree). KURAITH ดีกว่าด้าน task tracking และ visualization

---

## 7. Dashboard & Visualization

| | **Oracle** | **KURAITH** |
|---|-----------|------------|
| **Dashboard** | team.buildwithoracle.com (platform) | React SPA (self-hosted) |
| **Pages** | Fleet overview | **7 pages** — Dashboard, Mission Control, Documents, Pipeline, Workflows, Sessions, Search |
| **Mission Control** | ✅ agent fleet visualization | ✅ Fleet grid, operations, comms log, performance bars |
| **Pipeline view** | ❌ | ✅ Kanban 3-column |
| **Document mgmt** | ❌ (files only) | ✅ CRUD + filters + pagination |
| **Search UI** | ❌ | ✅ Full search interface |
| **Auth** | Platform auth | JWT + API key |
| **Theme** | — | Dark mode (cyan accent) |
| **Tech** | — | Vite 7, React, Tailwind v4 |

**วิเคราะห์**: KURAITH มี dashboard ครบกว่า (7 pages). Mission Control ทั้งคู่มีแต่คนละแนว

---

## 8. Infrastructure & DevOps

| | **Oracle** | **KURAITH** |
|---|-----------|------------|
| **Database** | ❌ (filesystem) | ✅ PostgreSQL 16 + pgvector |
| **ORM** | ❌ | Prisma 6 |
| **API** | MCP only | REST + MCP |
| **Auth** | ❌ | JWT + API key (krt_ prefix) |
| **Multi-user** | ❌ (single user per ψ/) | ✅ |
| **Rate limiting** | ❌ | ✅ 100 req/min |
| **Docker** | ❌ | ✅ multi-stage Dockerfile + Compose |
| **Deploy script** | ❌ | ✅ deploy.sh (rsync + Docker + Caddy SSL) |
| **Tests** | ❌ | ✅ 28 tests (vitest) |
| **Backup** | Git history | ✅ pg_dump script (7-day retention) |

**วิเคราะห์**: KURAITH เหนือกว่าชัดเจนด้าน infrastructure

---

## 9. Philosophy & Identity

| | **Oracle** | **KURAITH** |
|---|-----------|------------|
| **หลักการ** | 5 — Nothing Deleted, Patterns Over Intentions, External Brain Not Command, Curiosity Creates Existence, Form and Formless | 3 — append-only, patterns, external memory |
| **Identity** | resonance/ + CLAUDE.md | soul/KURAITH.soul.md + KURAITH.md |
| **Hermes routing** | ✅ auto-select Oracle ตาม context | ❌ |
| **Multi-instance** | ✅ 190 Oracles (specialized) | ❌ single instance |

---

## สรุปคะแนน

| ด้าน | Oracle ชนะ | KURAITH ชนะ | เสมอ |
|------|:---:|:---:|:---:|
| Agents | | | ✅ 17 vs 17 |
| Skills | ✅ 30 vs 15 | | |
| Installer | ✅ Binary (37ms) | | |
| Workspace isolation | ✅ Git worktree | | |
| Community | ✅ 190 Oracles | | |
| MCP Tools | | ✅ 12 vs ~6 | |
| Database | | ✅ PostgreSQL + pgvector | |
| API | | ✅ REST + MCP | |
| Auth | | ✅ JWT + API key | |
| Dashboard | | ✅ 7 pages + Mission Control | |
| Testing | | ✅ 28 automated tests | |
| Deployment | | ✅ Docker + deploy script | |
| Vector search | | ✅ Hybrid search | |
| Cross-device | | ✅ Server-based (automatic) | |
| Rate limiting | | ✅ | |
| Backup | | ✅ pg_dump | |
| Pipeline | | | ✅ ทั้งคู่มี |
| Local structure | | | ✅ ψ/ ≈ omega/ |
| Philosophy | | | ✅ คล้ายกัน |
| **รวม** | **4** | **11** | **4** |

> **Oracle** = เหนือกว่าด้าน **ecosystem** (agents, skills, community, maturity)
> **KURAITH** = เหนือกว่าด้าน **infrastructure** (database, API, dashboard, testing, deployment)

---

## สิ่งที่ Oracle มีแต่ KURAITH ยังไม่มี

| # | Feature | รายละเอียด | ความยาก |
|---|---------|-----------|---------|
| 1 | 15 skills เพิ่มเติม | gemini, about-oracle, birth-oracle, etc. (mostly Oracle-specific) | ปานกลาง |
| 2 | Binary installer | Pre-built binary (37ms startup) | ยาก |
| 3 | Git worktree workspace | Agent แต่ละตัวได้ branch + working dir แยก | ปานกลาง |
| 4 | Hermes routing | Auto-select agent ตาม context | ยาก |
| 5 | Multi-instance | หลาย KURAITH เฉพาะทาง | ยาก |
| 6 | LINE Bot integration | ส่งข้อความผ่าน LINE | ปานกลาง |

## สิ่งที่ KURAITH มีแต่ Oracle ไม่มี

| # | Feature | รายละเอียด |
|---|---------|-----------|
| 1 | PostgreSQL + pgvector | Database จริง + vector search |
| 2 | REST API | เปิดให้ app อื่นเรียกใช้ |
| 3 | Multi-user auth | JWT + API key, หลาย users |
| 4 | React Dashboard (7 pages) | Self-hosted, full management UI |
| 5 | Mission Control | Agent fleet visualization + performance |
| 6 | Knowledge Pipeline UI | Kanban view + refine tool + stage filters |
| 7 | Server-coordinated workflows | Task tracking + progress + status |
| 8 | Rate limiting | API protection |
| 9 | Automated tests | 28 tests (vitest) |
| 10 | Docker deployment | One-command deploy + backup |
| 11 | Cross-device sync | อัตโนมัติผ่าน server |
| 12 | Hybrid search | Keyword + vector search |

---

## Roadmap — ลำดับที่ควรทำ

### ~~Priority 1: ปิดช่องว่างด้าน Agents + Skills~~ ✅ DONE

- ✅ เพิ่ม 9 agents → **17 agents** เท่า Oracle
- ✅ เพิ่ม 5 skills ใหม่ (awaken, dig, deep-research, watch, birth) → **15 skills**
- ✅ Profiles: seed=7, standard=11, full=15

### Priority 2: Deploy + Launch (ต้องมี server)

#### 2.1 Debian Server Setup
```
1. ซื้อ/เช่า VPS (DigitalOcean, Vultr, etc.)
2. ซื้อ domain kuraith.com
3. bash deploy.sh <server-ip> kuraith.com
4. ตรวจสอบ: https://kuraith.com + https://mcp.kuraith.com/mcp
```

#### 2.2 Post-Deploy
- ตั้ง OPENAI_API_KEY บน server (เปิด vector search)
- ตั้ง cron job สำหรับ backup (daily)
- ตั้ง monitoring (uptime check)

### Priority 3: Git Worktree Integration (ปานกลาง)
เพิ่มความสามารถ MAW-style ให้ kuraith_workflow:
- สร้าง git worktree อัตโนมัติเมื่อ agent claim task
- sync ระหว่าง worktrees
- merge กลับเมื่อ task เสร็จ

### Priority 4: Hermes-style Routing (ยาก)
Auto-select agent ตาม context:
- วิเคราะห์ task description
- เลือก agent ที่เหมาะสมที่สุด
- assign อัตโนมัติใน workflow

### Priority 5: Multi-Instance (ยาก)
หลาย KURAITH เฉพาะทาง:
- KURAITH-Code (coding patterns)
- KURAITH-Research (academic)
- KURAITH-Ops (infrastructure)
- แต่ละตัวมี knowledge base แยก

### Priority 6: LINE Bot / Notifications (ปานกลาง)
- เชื่อมต่อ LINE Messaging API
- ส่ง notification เมื่อ workflow เสร็จ/ล้มเหลว
- รับคำสั่งผ่าน LINE

---

## สถานะปัจจุบัน (March 2026)

| Phase | Status |
|-------|--------|
| Phase 1: API Server + MCP | ✅ Done |
| Phase 2: Skills (10) + Installer | ✅ Done |
| Phase 3: Dashboard (7 pages) | ✅ Done |
| Phase 3.5: Mission Control | ✅ Done |
| Local tasks (tests, vector, rate limit, backup) | ✅ Done |
| Phase 4: Deploy | ⏳ Waiting (server + domain) |
| Priority 1: +9 agents, +5 skills | ✅ Done (17 agents, 15 skills) |
| Priority 2: Deploy + Launch | 🔜 Next (need server) |
| Priority 3: Git worktree integration | 📋 Planned |
| Priority 4: Hermes-style routing | 📋 Planned |
| Priority 5: Multi-instance | 📋 Planned |
| Priority 6: LINE Bot | 📋 Planned |
