# KURAITH Phase 1: API Server — อธิบายละเอียด

> Phase 1 คือการสร้าง **"สมอง"** ของ KURAITH
> เป็น server ที่ AI ทุกตัวคุยด้วยได้ เก็บความจำ ค้นหา เรียนรู้

---

## ภาพรวม — Phase 1 ทำอะไร?

```
Phase 1 = สร้าง API Server ที่ทำ 4 อย่าง:

  1. รับข้อมูลจาก AI → เก็บลง Database
  2. AI ถามอะไรมา → ค้นหาจาก Database แล้วตอบ
  3. Claude Code เชื่อมต่อผ่าน MCP → ใช้เครื่องมือ 8 ตัว
  4. เปิด REST API → Dashboard/app อื่นเรียกได้

ง่ายๆ คือ: สร้าง server ให้ AI มี "สมอง" เก็บข้อมูลได้
```

---

## 8 Steps มีอะไรบ้าง + ทำไมต้องทำ

```
Step 1.1  สร้างโปรเจค          ← ตั้งโปรเจค ลง library
   │
   ▼
Step 1.2  Database Schema       ← สร้างตาราง database
   │
   ▼
Step 1.3  Auth System           ← ระบบ login / API key
   │
   ▼
Step 1.4  REST API              ← API สำหรับ CRUD ข้อมูล
   │
   ▼
Step 1.5  Hybrid Search         ← ระบบค้นหาอัจฉริยะ
   │
   ▼
Step 1.6  MCP Server            ← ให้ Claude Code เชื่อมต่อได้
   │
   ▼
Step 1.7  Entry Point           ← รวมทุกอย่างเข้าด้วยกัน
   │
   ▼
Step 1.8  Docker                ← ทำให้ deploy ง่าย
```

---

## Step 1.1: สร้างโปรเจค

### ทำอะไร?
ตั้งโปรเจค TypeScript + ลง library ที่ต้องใช้

### ทำไมต้องทำ?
ทุกอย่างเริ่มจากตรงนี้ ไม่มีโปรเจค = ไม่มีอะไรเลย

### ทำยังไง?
```bash
cd ~/Workspace/kuraith
npm init -y
npm install fastify @fastify/cors @fastify/jwt    # web server
npm install prisma @prisma/client                  # database ORM
npm install @modelcontextprotocol/sdk              # MCP สำหรับ Claude Code
npm install -D typescript tsx @types/node           # TypeScript
npx tsc --init                                     # สร้าง tsconfig.json
```

### library แต่ละตัวทำอะไร?

```
fastify              → web server (เหมือน Express แต่เร็วกว่า)
@fastify/cors        → อนุญาตให้ browser เข้าถึง API ได้ (สำหรับ dashboard)
@fastify/jwt         → สร้าง/ตรวจ JWT token (สำหรับ login)
prisma               → เครื่องมือจัดการ database (สร้าง table, query)
@prisma/client       → client สำหรับ query database ใน code
@modelcontextprotocol/sdk → MCP SDK ให้ Claude Code เชื่อมต่อ
typescript           → ภาษา TypeScript
tsx                  → รัน TypeScript ได้เลย ไม่ต้อง compile ก่อน
```

### ผลลัพธ์
```
kuraith/
├── package.json        ← ข้อมูลโปรเจค + dependencies
├── tsconfig.json       ← ตั้งค่า TypeScript
├── .env.example        ← ตัวอย่าง environment variables
├── .gitignore
└── src/                ← โฟลเดอร์ code
    ├── api/
    ├── tools/
    ├── services/
    └── db/
```

---

## Step 1.2: Database Schema

### ทำอะไร?
ออกแบบ + สร้างตาราง database ใน PostgreSQL

### ทำไมต้องทำ?
Database คือที่เก็บ "ความจำ" ทั้งหมดของ KURAITH
ไม่มี database = AI จำอะไรไม่ได้

### Tables มีอะไร + ทำไมต้องมี?

```
┌─────────────────────────────────────────────────────────────┐
│                     12 Tables                                │
│                                                             │
│  👤 users                                                    │
│     เก็บข้อมูลผู้ใช้ — ใครใช้ KURAITH บ้าง                    │
│     ทำไม: รองรับหลายคนใช้ server เดียวกัน                    │
│                                                             │
│  🔑 api_keys                                                 │
│     เก็บ API key — ใช้แทน login สำหรับ AI agent              │
│     ทำไม: AI ไม่ได้พิมพ์ username/password                    │
│            ใช้ API key ส่งมาในทุก request แทน                │
│                                                             │
│  📄 documents                                                │
│     เก็บเอกสารทั้งหมด — knowledge base หลัก                  │
│     ทำไม: เก็บ session สรุป, บทเรียน, notes ทุกอย่าง         │
│     Fields: title, content, type (session/learning/note),    │
│             concepts (tags), project, superseded_by          │
│                                                             │
│  🧮 document_vectors                                         │
│     เก็บ vector embeddings ของเอกสาร                         │
│     ทำไม: ใช้สำหรับ semantic search                          │
│            (ค้นหาจากความหมาย ไม่ใช่แค่คำตรงๆ)                │
│     เช่น: ค้นหา "จ่ายเงิน" เจอเอกสารที่เขียน "payment"      │
│                                                             │
│  📋 sessions                                                 │
│     เก็บ record ของแต่ละ session                              │
│     ทำไม: รู้ว่า session ไหนทำอะไร เมื่อไหร่                   │
│                                                             │
│  🤝 handoffs                                                 │
│     เก็บข้อมูลส่งต่อระหว่าง session                            │
│     ทำไม: /forward เขียนลงที่นี่                               │
│            /recap อ่านจากที่นี่                                 │
│     สำคัญมาก: นี่คือหัวใจของการ "จำข้าม session"               │
│                                                             │
│  📚 learnings                                                │
│     เก็บบทเรียน / patterns ที่ค้นพบ                            │
│     ทำไม: "Prisma กับ PostgreSQL ต้อง cascade delete"        │
│            AI จดไว้ → ไม่ทำผิดซ้ำ                             │
│                                                             │
│  🔎 traces                                                   │
│     เก็บ discovery journeys — ค้นหาอะไรเจออะไร                │
│     ทำไม: /trace บันทึกว่าค้นหาเรื่องอะไร                     │
│            เจอข้อมูลตรงไหนบ้าง                                │
│                                                             │
│  🔗 trace_links                                              │
│     เชื่อม traces เข้าด้วยกัน                                  │
│     ทำไม: trace A เกี่ยวกับ trace B                           │
│            ทำให้เห็น journey ทั้งหมด                           │
│                                                             │
│  📊 activity_log                                             │
│     บันทึกกิจกรรมทั้งหมด — ใครทำอะไรเมื่อไหร่                  │
│     ทำไม: audit trail + ใช้แสดงใน dashboard                   │
│                                                             │
│  🔍 search_log                                               │
│     บันทึกการค้นหา — ค้นหาอะไร เจอกี่รายการ                   │
│     ทำไม: รู้ว่า user ค้นหาอะไรบ่อย → ปรับปรุง search ได้     │
│                                                             │
│  ⚙️  settings                                                 │
│     เก็บการตั้งค่าของแต่ละ user                                │
│     ทำไม: preferences ต่างๆ เช่น ภาษา, theme                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Local dev ใช้ Docker PostgreSQL

```bash
# รัน PostgreSQL + pgvector ด้วย Docker (dev เท่านั้น)
docker run -d \
  --name kuraith-db \
  -e POSTGRES_USER=kuraith \
  -e POSTGRES_PASSWORD=kuraith_dev \
  -e POSTGRES_DB=kuraith \
  -p 5432:5432 \
  pgvector/pgvector:pg16

# จากนั้น Prisma จะ migrate ให้อัตโนมัติ
npx prisma migrate dev --name init
```

### ผลลัพธ์
- PostgreSQL มี 12 tables พร้อมใช้งาน
- Prisma Client สร้าง type-safe query ให้อัตโนมัติ

---

## Step 1.3: Auth System

### ทำอะไร?
สร้างระบบ login + API key

### ทำไมต้องทำ?
Server อยู่บน internet → ต้องมี auth ป้องกันคนอื่นเข้า
AI agent ใช้ API key, มนุษย์ใช้ JWT token

### มี 2 วิธี login:

```
วิธีที่ 1: JWT Token (สำหรับมนุษย์/dashboard)
┌─────────┐    POST /api/auth/login     ┌──────────┐
│ Browser │  ──────────────────────────→ │ KURAITH  │
│         │  { email, password }         │ Server   │
│         │  ←────────────────────────── │          │
│         │  { token: "eyJhbG..." }      │          │
└─────────┘                              └──────────┘
  จากนั้นทุก request ส่ง:
  Authorization: Bearer eyJhbG...

วิธีที่ 2: API Key (สำหรับ AI agent)
┌─────────┐    ทุก request               ┌──────────┐
│ Claude  │  ──────────────────────────→ │ KURAITH  │
│ Code    │  x-api-key: krt_abc123...    │ Server   │
│         │  ←────────────────────────── │          │
│         │  { data: ... }               │          │
└─────────┘                              └──────────┘
  AI ไม่ต้อง login
  แค่ส่ง API key มาทุกครั้ง
```

### API endpoints:
```
POST /api/auth/register    → สร้าง user ใหม่
POST /api/auth/login       → login ได้ JWT token
POST /api/auth/api-key     → สร้าง API key สำหรับ AI agent
```

### ผลลัพธ์
- มนุษย์ login ผ่าน dashboard ได้
- AI agent ใช้ API key เชื่อมต่อได้

---

## Step 1.4: REST API

### ทำอะไร?
สร้าง API สำหรับ CRUD ข้อมูลทั้งหมด

### ทำไมต้องทำ?
Dashboard + AI agent ต้องมีทางเข้าถึงข้อมูล
REST API = ประตูหลักของ KURAITH

### Endpoints ทั้งหมด:

```
📄 Documents (ความจำ)
  GET    /api/documents          → ดูรายการเอกสารทั้งหมด
  GET    /api/documents/:id      → ดูเอกสาร 1 ชิ้น
  POST   /api/documents          → สร้างเอกสารใหม่
  PUT    /api/documents/:id      → แก้ไขเอกสาร
  DELETE /api/documents/:id      → soft delete (ทำเครื่องหมาย superseded)

🔍 Search (ค้นหา)
  GET    /api/search?q=xxx       → ค้นหา hybrid (keyword + semantic)

📋 Sessions
  GET    /api/sessions           → ดูประวัติ session
  POST   /api/sessions           → สร้าง session ใหม่

📊 Dashboard
  GET    /api/dashboard/stats    → สถิติรวม (จำนวน documents, sessions, etc.)
  GET    /api/dashboard/activity → กิจกรรมล่าสุด
```

### ตัวอย่างการใช้:
```bash
# สร้างเอกสาร
curl -X POST http://localhost:47700/api/documents \
  -H "x-api-key: krt_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Omise webhook pattern",
    "content": "ต้อง verify ด้วย event_key...",
    "type": "learning",
    "concepts": ["payment", "webhook", "omise"],
    "project": "my-shop"
  }'

# ค้นหา
curl "http://localhost:47700/api/search?q=payment webhook" \
  -H "x-api-key: krt_abc123"
```

### ผลลัพธ์
- CRUD ข้อมูลได้ครบ
- Dashboard เรียกข้อมูลได้

---

## Step 1.5: Hybrid Search Engine

### ทำอะไร?
สร้างระบบค้นหาอัจฉริยะ — ค้นได้ทั้งจากคำตรงๆ และจากความหมาย

### ทำไมต้องทำ?
นี่คือ **ฟีเจอร์สำคัญที่สุด** ของ KURAITH
ถ้าค้นหาไม่ดี = หาข้อมูลไม่เจอ = ไม่ต่างจากไม่มีความจำ

### ทำงานยังไง?

```
ผู้ใช้พิมพ์: "payment webhook"
       │
       ├── ช่องทาง 1: Keyword Search (PostgreSQL FTS)
       │   ค้นจากคำตรงๆ: "payment", "webhook"
       │   เจอเอกสารที่มีคำนี้
       │   คะแนน: 0.0 - 1.0
       │
       ├── ช่องทาง 2: Semantic Search (pgvector)
       │   แปลง "payment webhook" → vector [0.1, 0.3, ...]
       │   เทียบกับ vector ของทุกเอกสาร
       │   เจอเอกสารที่ "ความหมายคล้าย" แม้ไม่มีคำนี้ตรงๆ
       │   เช่น: เอกสารเขียน "ระบบจ่ายเงิน callback"
       │   คะแนน: 0.0 - 1.0
       │
       ▼
   รวมคะแนน:
   = (keyword × 0.5) + (semantic × 0.5)
   + 10% bonus ถ้าเจอทั้งสองช่องทาง
       │
       ▼
   เรียงจากคะแนนสูง → ต่ำ
   ส่งกลับให้ผู้ใช้
```

### Embedding คืออะไร?

```
Embedding = แปลงข้อความ → ตัวเลข (vector)

"payment webhook"  → [0.12, 0.85, 0.33, 0.07, ...]  (1536 ตัวเลข)
"ระบบจ่ายเงิน"      → [0.11, 0.83, 0.35, 0.09, ...]  (ใกล้เคียงกัน!)
"สีของแมว"          → [0.90, 0.02, 0.15, 0.77, ...]  (ต่างกันมาก)

ข้อความที่ความหมายใกล้เคียง → vector ใกล้เคียง
ข้อความที่ความหมายต่าง → vector ต่าง

ใช้ OpenAI API สร้าง embedding:
  POST https://api.openai.com/v1/embeddings
  { model: "text-embedding-3-small", input: "payment webhook" }
```

### ผลลัพธ์
- ค้นหา "จ่ายเงิน" เจอเอกสารที่เขียน "payment" ได้
- ค้นหาฉลาดกว่า keyword อย่างเดียว

---

## Step 1.6: MCP Server

### ทำอะไร?
สร้าง MCP Server ที่ Claude Code เชื่อมต่อได้

### ทำไมต้องทำ?
MCP (Model Context Protocol) = วิธีที่ Claude Code คุยกับเครื่องมือภายนอก
ถ้าไม่มี MCP → Claude Code เรียกใช้ KURAITH ไม่ได้

### MCP คืออะไร?

```
ปกติ Claude Code ทำได้แค่:
  - อ่านไฟล์
  - เขียนไฟล์
  - รัน bash command

ด้วย MCP, Claude Code ทำได้เพิ่ม:
  - kuraith_search("payment")     → ค้นหาจาก KURAITH
  - kuraith_learn("บทเรียน...")    → บันทึกบทเรียน
  - kuraith_handoff("งานค้าง...") → ส่งต่อ session
  - ... อีก 5 tools

MCP = ให้ Claude Code มี "เครื่องมือ" เพิ่ม
```

### 8 MCP Tools อธิบายทีละตัว:

```
1. kuraith_search(query, limit?)
   ค้นหาข้อมูลจาก KURAITH
   → AI ใช้ตอน: ต้องการหาข้อมูลเก่า
   → ตัวอย่าง: kuraith_search("payment webhook")
   → ได้: เอกสารที่เกี่ยวข้องทั้งหมด

2. kuraith_learn(title, content, concepts[], project?)
   บันทึกบทเรียน/pattern ใหม่
   → AI ใช้ตอน: เรียนรู้อะไรใหม่
   → ตัวอย่าง: kuraith_learn(
       "Omise webhook verification",
       "ต้อง verify ด้วย event_key ไม่ใช่ signature",
       ["omise", "webhook", "payment"]
     )

3. kuraith_handoff(content, project?)
   เขียน handoff สำหรับ session ถัดไป
   → AI ใช้ตอน: /forward — จบ session
   → ตัวอย่าง: kuraith_handoff(
       "งานค้าง: refund API, test webhook staging"
     )

4. kuraith_inbox(limit?)
   อ่าน handoff ล่าสุด
   → AI ใช้ตอน: /recap — เปิด session ใหม่
   → ได้: handoff จาก session ก่อน

5. kuraith_reflect()
   ดึงความรู้แบบสุ่ม 1 ชิ้น
   → AI ใช้ตอน: ต้องการ inspiration
   → ได้: บทเรียนหรือ principle สุ่ม 1 อัน

6. kuraith_stats()
   ดูสถิติ KURAITH
   → ได้: จำนวน documents, sessions, learnings, etc.

7. kuraith_trace(query, results, project?)
   บันทึก discovery journey
   → AI ใช้ตอน: /trace — ค้นหาแล้วจดว่าเจออะไร
   → ตัวอย่าง: kuraith_trace(
       "payment integration",
       "เจอใน: git commit abc, file payment.ts, session 12"
     )

8. kuraith_supersede(document_id, reason?)
   ทำเครื่องหมายว่าเอกสารเก่าแล้ว
   → AI ใช้ตอน: ข้อมูลเก่าไม่ถูกต้องแล้ว
   → ไม่ลบ แค่บอกว่า "อันนี้ outdated แล้ว"
   → ตรงกับปรัชญา "Nothing is Forgotten"
```

### Claude Code เชื่อมต่อยังไง?

```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "kuraith": {
      "type": "sse",
      "url": "http://YOUR-SERVER-IP:47700/mcp",
      "headers": {
        "x-api-key": "krt_your_api_key_here"
      }
    }
  }
}
```

### ผลลัพธ์
- Claude Code เรียก kuraith_search, kuraith_learn ได้
- SKILL.md ของ Phase 2 จะสั่งให้ AI เรียก tools เหล่านี้

---

## Step 1.7: Entry Point

### ทำอะไร?
รวมทุกอย่าง (Fastify + API + MCP + Auth) เข้าด้วยกัน เป็น server ตัวเดียว

### ทำไมต้องทำ?
ก่อนหน้านี้แต่ละ step สร้างแยกกัน ตอนนี้ต้องประกอบร่างเป็นตัวเดียว

### สิ่งที่เกิดเมื่อ start server:

```
$ npm run dev

  ┌────────────────────────────────────────┐
  │  🟢 KURAITH Server starting...          │
  │                                        │
  │  ✅ PostgreSQL connected                │
  │  ✅ Prisma client ready                 │
  │  ✅ FTS index ready                     │
  │  ✅ pgvector extension loaded           │
  │  ✅ REST API routes registered           │
  │  ✅ MCP Server ready (HTTP/SSE)          │
  │  ✅ Auth middleware active               │
  │                                        │
  │  🌐 API:  http://localhost:47700        │
  │  🔌 MCP:  http://localhost:47700/mcp    │
  │                                        │
  │  KURAITH is ready. เงาที่ไม่เคยลืม.       │
  └────────────────────────────────────────┘
```

---

## Step 1.8: Docker

### ทำอะไร?
ทำให้ทุกอย่างรันด้วย `docker-compose up` คำสั่งเดียว

### ทำไมต้องทำ?
- ไม่ต้องติดตั้ง PostgreSQL เอง
- Deploy บน server ง่าย
- คนอื่น clone มา → `docker-compose up` → ใช้ได้เลย

### docker-compose จะมี 2 containers:

```yaml
services:
  kuraith:          # KURAITH API Server
    port: 47700
    depends_on: db

  db:               # PostgreSQL + pgvector
    port: 5432
    volumes: data   # เก็บข้อมูลถาวร
```

### ผลลัพธ์
```bash
docker-compose up -d
# → PostgreSQL + KURAITH server พร้อมใช้งาน
# → เข้า http://server-ip:47700 ได้เลย
```

---

## สรุป Phase 1 ทั้งหมด

```
Step  │ ทำอะไร              │ ทำไม                        │ ผลลัพธ์
──────┼────────────────────┼────────────────────────────┼──────────────────
1.1   │ สร้างโปรเจค         │ ตั้งต้นทุกอย่าง              │ โปรเจค + library
1.2   │ Database Schema     │ ที่เก็บความจำ                │ 12 tables
1.3   │ Auth System         │ ป้องกันคนอื่นเข้า            │ JWT + API key
1.4   │ REST API            │ ประตูเข้าถึงข้อมูล            │ 10 endpoints
1.5   │ Hybrid Search       │ ค้นหาอัจฉริยะ               │ keyword + semantic
1.6   │ MCP Server          │ Claude Code เชื่อมต่อ        │ 8 tools
1.7   │ Entry Point         │ รวมทุกอย่าง                  │ server ตัวเดียว
1.8   │ Docker              │ deploy ง่าย                  │ docker-compose up
```

### เมื่อ Phase 1 เสร็จ จะได้:

```
✅ Server ที่ AI คุยด้วยได้ (MCP)
✅ เก็บความจำลง PostgreSQL
✅ ค้นหาฉลาดๆ (keyword + semantic)
✅ Login/API key ปลอดภัย
✅ Docker → deploy ที่ไหนก็ได้
✅ Claude Code เชื่อมต่อ → ใช้ 8 tools ได้

❌ ยังไม่มี Skills (/recap, /learn) — Phase 2
❌ ยังไม่มี Dashboard — Phase 3
```

---

## ลำดับการทำงานจริง (เริ่มเลย)

```
1. รัน Docker PostgreSQL (dev)          ← 5 นาที
2. npm init + ลง dependencies           ← 5 นาที
3. เขียน Prisma schema + migrate        ← 30 นาที
4. สร้าง Fastify server + auth          ← 1-2 ชม.
5. สร้าง REST API (documents, search)   ← 1-2 ชม.
6. สร้าง Hybrid Search engine           ← 2-3 ชม.
7. สร้าง MCP Server + 8 tools           ← 2-3 ชม.
8. รวม entry point + ทดสอบ              ← 1 ชม.
9. Docker compose                       ← 30 นาที

รวม: ~10-12 ชั่วโมง (1-2 วัน)
```
