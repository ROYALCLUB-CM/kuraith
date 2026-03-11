# KURAITH — Master Checklist

> อัปเดตล่าสุด: 7 มี.ค. 2026
> Status: Phase 1 — กำลังทำ API Server

---

## Phase 0: เตรียมตัว

- [ ] **0.1** จด domain kuraith.com ← ไว้ทีหลัง
- [x] **0.2** สร้าง GitHub repos
  - [x] สร้าง repo `kuraith` → https://github.com/ROYALCLUB-CM/kuraith
  - [x] สร้าง repo `kuraith-skills` → https://github.com/ROYALCLUB-CM/kuraith-skills
  - [x] สร้าง repo `kuraith-docs` → https://github.com/ROYALCLUB-CM/kuraith-docs
  - [x] Init local projects + folder structure
- [ ] **0.3** Setup Debian server ← ไว้ทีหลัง
  - [ ] ติดตั้ง Node.js 22 (via nvm)
  - [ ] ติดตั้ง PostgreSQL 16
  - [ ] ติดตั้ง pgvector extension
  - [ ] Setup firewall (ufw) — เปิด port 22, 80, 443, 47700
  - [ ] Setup SSL cert (Let's Encrypt + certbot)
  - [ ] Setup nginx reverse proxy
  - [ ] สร้าง database `kuraith` + user

---

## Phase 1: API Server (kuraith)

### Step 1.1: สร้างโปรเจค
- [ ] `mkdir kuraith && cd kuraith && npm init -y`
- [ ] ติดตั้ง dependencies:
  - [ ] `fastify`, `@fastify/cors`, `@fastify/jwt`
  - [ ] `prisma`, `@prisma/client`
  - [ ] `@modelcontextprotocol/sdk`
  - [ ] `typescript`, `tsx`, `@types/node`
- [ ] สร้าง `tsconfig.json`
- [ ] สร้างโครงสร้างโฟลเดอร์ `src/`

### Step 1.2: Database Schema (Prisma)
- [ ] เขียน `prisma/schema.prisma`
  - [ ] Table: `users` (id, email, name, password_hash, created_at)
  - [ ] Table: `api_keys` (id, user_id, key, name, created_at, last_used)
  - [ ] Table: `documents` (id, user_id, title, content, type, concepts, project, superseded_by, created_at, updated_at)
  - [ ] Table: `document_vectors` (id, document_id, embedding vector(1536))
  - [ ] Table: `sessions` (id, user_id, summary, project, started_at, ended_at)
  - [ ] Table: `handoffs` (id, user_id, session_id, content, project, created_at, read_at)
  - [ ] Table: `learnings` (id, user_id, title, content, concepts, project, created_at)
  - [ ] Table: `traces` (id, user_id, query, results, project, created_at)
  - [ ] Table: `trace_links` (id, source_id, target_id, created_at)
  - [ ] Table: `activity_log` (id, user_id, action, details, created_at)
  - [ ] Table: `search_log` (id, user_id, query, results_count, created_at)
  - [ ] Table: `settings` (id, user_id, key, value)
- [ ] Run `npx prisma migrate dev --name init`
- [ ] ทดสอบว่า tables สร้างถูกต้อง

### Step 1.3: Auth System
- [ ] สร้าง `src/api/auth.ts`
  - [ ] POST `/api/auth/register` — สร้าง user ใหม่
  - [ ] POST `/api/auth/login` — login → JWT token
  - [ ] POST `/api/auth/api-key` — สร้าง API key
  - [ ] Middleware: verify JWT / API key ทุก request
- [ ] ทดสอบ auth ด้วย curl/httpie

### Step 1.4: REST API
- [ ] สร้าง `src/api/documents.ts`
  - [ ] GET `/api/documents` — list documents (paginated)
  - [ ] GET `/api/documents/:id` — get document
  - [ ] POST `/api/documents` — create document
  - [ ] PUT `/api/documents/:id` — update document
  - [ ] DELETE `/api/documents/:id` — soft delete (supersede)
- [ ] สร้าง `src/api/search.ts`
  - [ ] GET `/api/search?q=xxx` — hybrid search
- [ ] สร้าง `src/api/sessions.ts`
  - [ ] GET `/api/sessions` — list sessions
  - [ ] POST `/api/sessions` — create session
- [ ] สร้าง `src/api/dashboard.ts`
  - [ ] GET `/api/dashboard/stats` — overview stats
  - [ ] GET `/api/dashboard/activity` — recent activity

### Step 1.5: Hybrid Search Engine
- [ ] สร้าง `src/services/search.ts`
  - [ ] PostgreSQL Full-Text Search (tsvector + tsquery)
  - [ ] pgvector semantic search
  - [ ] Combined scoring: 50% FTS + 50% vector + 10% hybrid boost
  - [ ] Fallback: ถ้า vector ไม่พร้อม → ใช้ FTS อย่างเดียว
- [ ] สร้าง `src/services/embeddings.ts`
  - [ ] ใช้ OpenAI embeddings API (text-embedding-3-small) หรือ local model
  - [ ] Auto-embed เมื่อสร้าง/อัปเดต document
- [ ] ทดสอบ search ด้วยข้อมูลจำลอง

### Step 1.6: MCP Server
- [ ] สร้าง `src/mcp.ts`
  - [ ] MCP Server ด้วย HTTP/SSE transport
  - [ ] Register 8 tools
- [ ] สร้าง `src/tools/search.ts` — kuraith_search
- [ ] สร้าง `src/tools/learn.ts` — kuraith_learn
- [ ] สร้าง `src/tools/handoff.ts` — kuraith_handoff
- [ ] สร้าง `src/tools/inbox.ts` — kuraith_inbox
- [ ] สร้าง `src/tools/reflect.ts` — kuraith_reflect
- [ ] สร้าง `src/tools/stats.ts` — kuraith_stats
- [ ] สร้าง `src/tools/trace.ts` — kuraith_trace
- [ ] สร้าง `src/tools/supersede.ts` — kuraith_supersede
- [ ] ทดสอบ MCP connection จาก Claude Code

### Step 1.7: Server Entry Point
- [ ] สร้าง `src/server.ts` — Fastify server (port 47700)
- [ ] สร้าง `src/index.ts` — entry point (start server + MCP)
- [ ] สร้าง `.env.example`
- [ ] ทดสอบ server start/stop

### Step 1.8: Docker
- [ ] สร้าง `Dockerfile`
- [ ] สร้าง `docker-compose.yml` (KURAITH + PostgreSQL + pgvector)
- [ ] ทดสอบ `docker-compose up`
- [ ] Deploy บน Debian server
- [ ] ทดสอบ remote access จาก MacBook

---

## Phase 2: Skills CLI (kuraith-skills)

### Step 2.1: CLI Framework
- [ ] `mkdir kuraith-skills && cd kuraith-skills && npm init -y`
- [ ] ติดตั้ง: `commander`, `@clack/prompts`, `typescript`
- [ ] สร้าง `src/cli/index.ts` (Commander.js entry)
- [ ] สร้าง `src/cli/agents.ts` (agent registry — 4 agents)
- [ ] สร้าง `src/cli/installer.ts` (install/uninstall logic)
- [ ] ทดสอบ: `npx kuraith-skills install --help`

### Step 2.2: เขียน 10 Skills
- [ ] สร้าง `src/skills/recap/SKILL.md`
  - [ ] อ่าน handoff ล่าสุด → สรุปให้ user
- [ ] สร้าง `src/skills/learn/SKILL.md`
  - [ ] สำรวจ codebase/url → จดบันทึกลง KURAITH
- [ ] สร้าง `src/skills/rrr/SKILL.md`
  - [ ] Review วันนี้ → บทเรียน → diary → บันทึก
- [ ] สร้าง `src/skills/forward/SKILL.md`
  - [ ] สร้าง handoff → งานที่ค้าง → context สำคัญ
- [ ] สร้าง `src/skills/standup/SKILL.md`
  - [ ] Daily standup → done/doing/blockers
- [ ] สร้าง `src/skills/trace/SKILL.md`
  - [ ] ค้นหาข้าม memory + git + repos
- [ ] สร้าง `src/skills/who-are-you/SKILL.md`
  - [ ] แสดงตัวตน KURAITH + ปรัชญา
- [ ] สร้าง `src/skills/feel/SKILL.md`
  - [ ] บันทึกอารมณ์ + พลังงาน
- [ ] สร้าง `src/skills/philosophy/SKILL.md`
  - [ ] แสดงปรัชญา 3 ข้อ
- [ ] สร้าง `src/skills/speak/SKILL.md`
  - [ ] Text-to-speech ผ่าน macOS say / edge-tts
- [ ] ทดสอบทุก skill กับ Claude Code

### Step 2.3: Installer
- [ ] install command: copy SKILL.md → agent skills dirs
- [ ] uninstall command: ลบ skills
- [ ] list command: แสดง skills ที่ติดตั้ง
- [ ] ทดสอบ install/uninstall

### Step 2.4: Distribution
- [ ] สร้าง `install.sh` (curl | bash one-liner)
- [ ] npm publish `kuraith-skills`
- [ ] ทดสอบ `npx kuraith-skills install -g -y`

---

## Phase 3: Dashboard (frontend)

### Step 3.1: Setup
- [ ] `npm create vite@latest frontend -- --template react-ts`
- [ ] ติดตั้ง: react-router, tailwindcss, chart.js
- [ ] สร้าง API client (`src/api/kuraith.ts`)

### Step 3.2: Pages
- [ ] Login page — JWT auth
- [ ] Overview page — stats cards, recent activity
- [ ] Search page — ค้นหา knowledge base + filters
- [ ] Sessions page — session history + handoffs
- [ ] Learnings page — patterns + learnings
- [ ] Activity page — usage graph + analytics
- [ ] Settings page — API keys, preferences, profile

### Step 3.3: Deploy
- [ ] Build: `npm run build`
- [ ] Serve ผ่าน nginx หรือ Fastify static
- [ ] ทดสอบเข้าจาก browser

---

## Phase 4: Distribution & Launch

### Step 4.1: Domain & Server
- [ ] จด kuraith.com
- [ ] ชี้ DNS → Debian server IP
- [ ] nginx config: kuraith.com → API (47700), dashboard (3000)
- [ ] SSL cert (Let's Encrypt)

### Step 4.2: Documentation
- [ ] README.md — ภาพรวม + quick start
- [ ] Getting started guide — step by step
- [ ] API reference — ทุก endpoint
- [ ] Skills guide — วิธีสร้าง skill ใหม่
- [ ] Philosophy — ปรัชญา KURAITH

### Step 4.3: Launch
- [ ] npm publish final version
- [ ] GitHub release
- [ ] ทดสอบ fresh install บนเครื่องใหม่
- [ ] ทดสอบ cross-device (MacBook → PC)

---

## สถานะปัจจุบัน

```
Phase 0: เตรียมตัว     ⬜ ยังไม่เริ่ม
Phase 1: API Server    ⬜ ยังไม่เริ่ม
Phase 2: Skills CLI    ⬜ ยังไม่เริ่ม
Phase 3: Dashboard     ⬜ ยังไม่เริ่ม
Phase 4: Launch        ⬜ ยังไม่เริ่ม
```

---

## หมายเหตุ

- ทำ Phase 1 ก่อน เพราะเป็นแกนกลาง ถ้าไม่มี server = skills ไม่มีที่เก็บข้อมูล
- Phase 1 สามารถ dev บน local ก่อนได้ (ใช้ PostgreSQL local) ไม่ต้องรอ server
- Phase 2 ทำคู่กับ Phase 1 ได้ (เขียน SKILL.md ก่อน แล้วค่อยเชื่อม MCP ทีหลัง)
- Phase 3 ทำทีหลังได้ ไม่ urgent — CLI ใช้งานได้ก่อน
- Domain ควรจดเร็วๆ ก่อนคนอื่นจดไป
