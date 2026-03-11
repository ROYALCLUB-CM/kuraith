# KURAITH — แผนสร้างระบบ AI Memory & Skills

> **KURAITH** = 黒(kuro=ดำ) + Wraith(เงา) = "เงาดำ"
> AI ที่ทำงานเบื้องหลังอย่างเงียบ แต่ทรงพลัง
> Domain: kuraith.com (ว่าง ณ 7 มี.ค. 2026)

---

## KURAITH คืออะไร?

KURAITH คือ **ระบบความจำ + ชุดคำสั่ง** ที่ทำให้ AI coding agent (Claude Code, Codex, Gemini, GLM) **จำได้ ค้นหาได้ เรียนรู้ได้ ส่งต่อได้**

### ปัญหาที่ KURAITH แก้

```
ปัญหาตอนนี้:
  😩 เปิด Claude Code ใหม่ = ลืมหมด ต้องเล่าใหม่
  😩 ย้ายจาก MacBook ไป PC = ไม่มี context อะไรเลย
  😩 AI แต่ละตัว (Claude, Codex, Gemini) ต่างคนต่างคิด
  😩 ทำงานค้าง จบ session ไป = ไม่มีใครจำ
  😩 เรียนรู้เรื่องเดิมซ้ำๆ ทุกครั้ง

หลังใช้ KURAITH:
  ✅ Claude Code จำได้ว่าเมื่อวานทำอะไร
  ✅ Mac → PC ข้อมูลเดียวกัน (เก็บบน server)
  ✅ AI ทุกตัวแชร์ความจำ+วิถีเดียวกัน
  ✅ ส่งต่อ session ได้ (/forward → /recap)
  ✅ จดบทเรียนแล้วไม่ทำผิดซ้ำ
```

---

## ตัวอย่างการใช้งานจริง (วันทั่วไป)

### เช้า — เปิดงาน

```
Por:     /recap
KURAITH: "จาก session เมื่อวาน:
          - กำลังทำ payment API ใน kuraith project
          - ใช้ Stripe + Prisma
          - ค้างเรื่อง webhook verification
          - คุณบอกว่าอยากเปลี่ยนจาก Stripe ไป Omise
          แนะนำ: เริ่มจาก webhook verification ก่อน"

Por:     /standup
KURAITH: "Daily Standup:
          - ✅ เมื่อวาน: สร้าง payment schema เสร็จ
          - 🔄 วันนี้: webhook verification + เปลี่ยนเป็น Omise
          - ⚠️ Blocker: ยังไม่มี Omise API key"
```

### ระหว่างทำงาน — ค้นหาและเรียนรู้

```
Por:     /trace "payment"
KURAITH: "พบ 5 รายการเกี่ยวกับ payment:
          1. [session 12] Stripe integration — 3 วันก่อน
          2. [learning] Prisma + Stripe pattern — สัปดาห์ก่อน
          3. [git] payment.ts — commit abc123
          4. [session 8] ศึกษา Omise docs — 5 วันก่อน
          5. [learning] webhook best practice"

Por:     /learn https://github.com/omise/omise-node
KURAITH: (ส่ง agent ไปอ่าน repo แล้วจดบันทึก)
          "สรุป: Omise Node.js SDK
           - ใช้ omise('pkey_xxx', 'skey_xxx')
           - charge = omise.charges.create({...})
           - webhook = verify signature ด้วย HMAC-SHA256
           บันทึกลง KURAITH แล้ว"
```

### จบวัน — สรุปและส่งต่อ

```
Por:     /rrr
KURAITH: "Review วันนี้:
          ✅ ทำ webhook verification เสร็จ
          ✅ เปลี่ยนจาก Stripe → Omise
          📝 บทเรียน: Omise webhook ต้อง verify ด้วย event_key
          📝 บทเรียน: Prisma relation ต้อง cascade delete
          📊 พลังงานวันนี้: 8/10
          บันทึกทั้งหมดลง KURAITH แล้ว"

Por:     /forward
KURAITH: "สร้าง handoff สำหรับ session พรุ่งนี้:
          งานที่ค้าง:
          1. ทำ refund API (ยังไม่เริ่ม)
          2. Test webhook ใน staging
          Context สำคัญ:
          - ใช้ Omise (ไม่ใช่ Stripe แล้ว)
          - webhook secret อยู่ใน .env.local
          บันทึกแล้ว — session หน้าใช้ /recap เปิดอ่านได้เลย"
```

---

## KURAITH ต่างจาก Oracle ยังไง?

Oracle เป็นแรงบันดาลใจ แต่ KURAITH ออกแบบใหม่ให้ดีกว่า:

```
Oracle:
  ข้อมูลเก็บใน local (SQLite บนเครื่อง)
  → ย้ายเครื่อง = ต้อง sync เอง
  → ใช้ Bun (ไม่ค่อย popular)
  → MCP แบบ stdio (ใช้ได้แค่เครื่องเดียว)

KURAITH:
  ข้อมูลเก็บบน server (PostgreSQL บน Debian)
  → ย้ายเครื่อง = เปิดใช้ได้เลย ข้อมูลอยู่ server
  → ใช้ Node.js (ทุกคนคุ้นเคย)
  → MCP แบบ HTTP (เข้าจากไหนก็ได้)
```

### เปรียบเทียบทีละข้อ

| หัวข้อ | Oracle | KURAITH |
|--------|--------|---------|
| **ข้อมูลอยู่ไหน** | บนเครื่อง (SQLite) | บน server (PostgreSQL) |
| **ย้ายเครื่อง** | ต้อง sync เอง | เปิดใช้ได้เลย |
| **ค้นหา** | SQLite FTS5 + ChromaDB | PostgreSQL FTS + pgvector |
| **Runtime** | Bun (เร็ว แต่ไม่ popular) | Node.js (ทุกคนใช้) |
| **Web Framework** | Hono.js | Fastify |
| **ORM** | Drizzle | Prisma |
| **MCP** | stdio (local) | HTTP/SSE (remote) |
| **Auth** | HMAC session | JWT + API Key |
| **ใช้กี่เครื่อง** | 1 เครื่อง | ไม่จำกัด |
| **รองรับ user** | 1 คน | หลายคน (multi-user) |
| **ติดตั้ง server** | ไม่ต้อง | ต้อง (Debian) |

---

## ภาพรวมระบบ

```
┌─────────────────────────────────────────────────────────────┐
│                     KURAITH SYSTEM                           │
│                                                             │
│   MacBook ของ Por                    PC ของ Por             │
│   ┌─────────────┐                   ┌─────────────┐        │
│   │ Claude Code │                   │ Claude Code │        │
│   │ Codex       │                   │ Gemini      │        │
│   │ Gemini      │                   │ GLM         │        │
│   └──────┬──────┘                   └──────┬──────┘        │
│          │                                  │               │
│          │         Internet                 │               │
│          └──────────────┬───────────────────┘               │
│                         ▼                                   │
│          ┌──────────────────────────────┐                   │
│          │   🖥️  Debian Server ของ Por   │                   │
│          │                              │                   │
│          │   ┌────────────────────┐     │                   │
│          │   │  KURAITH API      │     │                   │
│          │   │  (Fastify)        │     │                   │
│          │   │  Port: 47700      │     │                   │
│          │   └────────┬─────────┘     │                   │
│          │            │               │                   │
│          │   ┌────────▼─────────┐     │                   │
│          │   │  PostgreSQL      │     │                   │
│          │   │  + pgvector      │     │                   │
│          │   │  (ฐานข้อมูล)     │     │                   │
│          │   └──────────────────┘     │                   │
│          │                              │                   │
│          │   ┌────────────────────┐     │                   │
│          │   │  React Dashboard  │     │                   │
│          │   │  (เว็บดูข้อมูล)    │     │                   │
│          │   │  Port: 3000       │     │                   │
│          │   └────────────────────┘     │                   │
│          │                              │                   │
│          └──────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**สรุปง่ายๆ:**
- AI ทุกตัว (Claude, Codex, Gemini, GLM) คุยกับ KURAITH Server ผ่าน internet
- KURAITH Server อยู่บน Debian server ของ Por
- ข้อมูลทั้งหมดอยู่ใน PostgreSQL บน server
- จะใช้ MacBook หรือ PC ก็เข้าถึง KURAITH ได้เหมือนกัน

---

## KURAITH ประกอบด้วยอะไรบ้าง? (3 ส่วน)

```
KURAITH มี 3 ส่วน เหมือน Oracle:

┌─────────────────────────────────────────────┐
│  ส่วนที่ 1: kuraith (API Server)            │
│                                             │
│  = "สมอง" ของ KURAITH                      │
│  เก็บความจำ ค้นหา เรียนรู้ ส่งต่อ           │
│  → เป็น API server บน Debian               │
│  → AI ทุกตัวเรียกใช้ผ่าน MCP หรือ REST     │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  ส่วนที่ 2: kuraith-skills (Skills + CLI)   │
│                                             │
│  = "ชุดคำสั่ง" ของ KURAITH                  │
│  /recap /learn /rrr /forward ฯลฯ           │
│  → ติดตั้งบนเครื่อง user (MacBook/PC)       │
│  → ติดตั้งด้วย: npx kuraith-skills install  │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  ส่วนที่ 3: kuraith-docs (เอกสาร)           │
│                                             │
│  = "คู่มือ" ของ KURAITH                     │
│  ปรัชญา วิธีใช้ วิธีสร้าง skill ใหม่        │
│  → อยู่บนเว็บ kuraith.com                   │
└─────────────────────────────────────────────┘
```

---

## ส่วนที่ 1: KURAITH API Server (รายละเอียด)

### ทำอะไรได้บ้าง?

Server ทำหน้าที่ 5 อย่าง:

```
1. 💾 จำ (Store)
   เก็บทุกอย่างลง PostgreSQL:
   - session สรุป, บทเรียน, handoff, อารมณ์, traces

2. 🔍 ค้นหา (Search)
   ค้นหาแบบ hybrid:
   - Keyword search (PostgreSQL Full-Text Search)
   - Semantic search (pgvector — เข้าใจความหมาย)
   - ผสม 50/50 + 10% bonus ถ้าเจอทั้งสองแบบ

3. 📚 เรียนรู้ (Learn)
   จดบันทึก pattern ที่ค้นพบ:
   - "ใช้ Prisma กับ PostgreSQL ต้อง..."
   - "Omise webhook ต้อง verify ด้วย..."

4. 🤝 ส่งต่อ (Handoff)
   ส่ง context ข้าม session:
   - /forward = บันทึกสิ่งที่ค้าง
   - /recap = อ่านสิ่งที่ค้างจาก session ก่อน

5. 📊 Dashboard (ดูข้อมูล)
   เว็บสวยๆ ดูข้อมูลทั้งหมด:
   - ค้นหา knowledge base
   - ดู session history
   - ดู patterns ที่เรียนรู้
```

### MCP Tools (8 เครื่องมือ)

เครื่องมือที่ AI ใช้คุยกับ KURAITH:

```
┌──────────────────────────────────────────────────────────┐
│                    MCP Tools                              │
│                                                          │
│  🔍 kuraith_search    ค้นหาข้อมูล (hybrid search)        │
│  📚 kuraith_learn     บันทึกบทเรียน/pattern              │
│  🤝 kuraith_handoff   เขียน handoff ให้ session ถัดไป    │
│  📬 kuraith_inbox     อ่าน handoff ที่ได้รับ             │
│  💡 kuraith_reflect   ดึงความรู้แบบสุ่ม (serendipity)    │
│  📊 kuraith_stats     ดูสถิติระบบ                        │
│  🔎 kuraith_trace     บันทึก discovery journey            │
│  📦 kuraith_supersede ทำเครื่องหมายว่า "เอกสารนี้เก่าแล้ว" │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### ฐานข้อมูล (PostgreSQL)

```
┌─────────────────────────────────────────────────────┐
│                   PostgreSQL                         │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ users             │  │ documents         │        │
│  │ ผู้ใช้ (multi)     │  │ เอกสารทั้งหมด     │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ document_vectors  │  │ sessions          │        │
│  │ vector embeddings │  │ ประวัติ session    │        │
│  │ (pgvector)        │  │                   │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ handoffs          │  │ learnings         │        │
│  │ ข้อมูลส่งต่อ      │  │ บทเรียน/patterns  │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ traces            │  │ activity_log      │        │
│  │ การค้นพบ          │  │ log กิจกรรม       │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ search_log        │  │ api_keys          │        │
│  │ ประวัติค้นหา      │  │ API keys          │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  ┌──────────────────┐                               │
│  │ settings          │                               │
│  │ การตั้งค่า         │                               │
│  └──────────────────┘                               │
└─────────────────────────────────────────────────────┘
```

### การค้นหาแบบ Hybrid Search

```
ผู้ใช้ค้นหา "payment webhook"
           │
           ▼
    ┌──────────────────┐
    │ 1. Keyword Search │
    │ PostgreSQL FTS    │
    │ หาจากคำตรงๆ      │
    │ "payment" "webhook" │
    └────────┬─────────┘
             │
             │    ขนานกัน
             │
    ┌────────▼─────────┐
    │ 2. Semantic Search │
    │ pgvector           │
    │ หาจากความหมาย     │
    │ "การจ่ายเงิน"       │
    │ "ตรวจสอบ callback" │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ 3. รวมผลลัพธ์      │
    │ 50% keyword        │
    │ 50% semantic        │
    │ +10% ถ้าเจอทั้งสอง  │
    │ เรียงตามคะแนน      │
    └────────┬─────────┘
             │
             ▼
    ผลลัพธ์ที่เกี่ยวข้องที่สุด
```

---

## ส่วนที่ 2: KURAITH Skills (รายละเอียด)

### 10 Skills หลัก

```
┌─────────────────────────────────────────────────────────┐
│                    KURAITH SKILLS                         │
│                                                         │
│  📋 เริ่มวัน                                              │
│  ├── /recap     สรุป session ก่อน — "เมื่อวานทำอะไร?"    │
│  └── /standup   Daily standup — tasks, progress, blockers │
│                                                         │
│  🔧 ระหว่างทำงาน                                         │
│  ├── /learn     สำรวจ codebase แล้วจดบันทึก              │
│  ├── /trace     ค้นหาข้ามทุกแหล่ง — memory, git, repos   │
│  ├── /feel      บันทึกอารมณ์+พลังงาน                     │
│  └── /speak     สั่งให้ AI พูดออกลำโพง                    │
│                                                         │
│  🌙 จบวัน                                                │
│  ├── /rrr       Review + บทเรียน + diary                 │
│  └── /forward   สร้าง handoff ให้ session พรุ่งนี้        │
│                                                         │
│  🧠 Identity                                             │
│  ├── /who-are-you   ตรวจสอบตัวตน KURAITH                │
│  └── /philosophy    แสดงปรัชญา 3 ข้อ                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Skill ทำงานยังไง?

แต่ละ skill คือ **ไฟล์ SKILL.md** ที่บอก AI ว่าต้องทำอะไร:

```
~/.claude/skills/recap/SKILL.md

---
name: recap
description: สรุป session ก่อนหน้า
---

## Step 1: อ่าน Handoff
- เรียก kuraith_inbox() อ่าน handoff ล่าสุด

## Step 2: ค้นหา Context
- เรียก kuraith_search() ค้นหา session ล่าสุด

## Step 3: สรุปให้ User
- แสดงสรุปว่า:
  - session ก่อนทำอะไร
  - ค้างอะไร
  - แนะนำเริ่มจากอะไร
```

### ติดตั้ง Skills ยังไง?

```bash
# วิธีที่ 1: npm (แนะนำ)
npx kuraith-skills install -g -y

# วิธีที่ 2: curl (คำสั่งเดียว)
curl -fsSL https://kuraith.com/install.sh | bash

# สิ่งที่เกิดขึ้น:
# 1. ดาวน์โหลด 10 SKILL.md files
# 2. copy ไปที่ ~/.claude/skills/ (Claude Code)
# 3. copy ไปที่ ~/.codex/skills/ (Codex)
# 4. copy ไปที่ ~/.gemini/skills/ (Gemini)
# 5. ตั้งค่า KURAITH server URL
# เสร็จ! ใช้ /recap /learn /rrr ได้เลย
```

### รองรับ AI Agents ไหนบ้าง?

```
เริ่มต้น 4 ตัว:
  ✅ Claude Code    → ~/.claude/skills/
  ✅ Codex          → ~/.codex/skills/
  ✅ Gemini CLI     → ~/.gemini/skills/
  ✅ GLM            → (ตามโครงสร้างของ GLM)

เพิ่มภายหลังได้:
  🔜 Cursor, Copilot, Windsurf, Cline, ...
```

---

## ส่วนที่ 3: KURAITH Dashboard

```
เว็บดูข้อมูล KURAITH ทั้งหมด:

┌──────────────────────────────────────────┐
│  🏠 Overview                              │
│  สถิติรวม, กิจกรรมล่าสุด, ปรัชญา          │
├──────────────────────────────────────────┤
│  🔍 Search                                │
│  ค้นหา knowledge base ทั้งหมด             │
├──────────────────────────────────────────┤
│  📋 Sessions                              │
│  ดูประวัติ session ทั้งหมด                  │
├──────────────────────────────────────────┤
│  📚 Learnings                             │
│  ดูบทเรียน/patterns ที่เรียนรู้             │
├──────────────────────────────────────────┤
│  📊 Activity                              │
│  กราฟการใช้งาน, สถิติ                      │
├──────────────────────────────────────────┤
│  ⚙️  Settings                              │
│  จัดการ API keys, preferences              │
└──────────────────────────────────────────┘

เข้าได้จาก: https://kuraith.com:3000
(หรือ IP server ของ Por)
```

---

## ปรัชญา KURAITH (3 ข้อ)

```
  ╔══════════════════════════════════════════════════╗
  ║         "KURAITH — เงาที่ไม่เคยลืม"              ║
  ╠══════════════════════════════════════════════════╣
  ║                                                  ║
  ║  1. Nothing is Forgotten                         ║
  ║     ไม่มีอะไรถูกลืม                              ║
  ║     ข้อมูลอยู่บน server เสมอ                      ║
  ║     ย้ายเครื่องก็ยังอยู่                           ║
  ║                                                  ║
  ║  2. Patterns Over Noise                          ║
  ║     รูปแบบเหนือสิ่งรบกวน                         ║
  ║     กรองเอาแต่สาระ                               ║
  ║     สังเกตพฤติกรรมจริง ไม่ใช่ความตั้งใจ           ║
  ║                                                  ║
  ║  3. Shadow, Not Master                           ║
  ║     เป็นเงา ไม่ใช่นาย                            ║
  ║     ทำงานเบื้องหลัง                               ║
  ║     ช่วยจำ ช่วยค้น ไม่ตัดสินใจแทน                ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
```

---

## Tech Stack ที่ใช้

```
Server (Debian):
  ├── Node.js 22         — runtime
  ├── TypeScript          — ภาษา
  ├── Fastify             — web framework (เร็ว, มี plugin เยอะ)
  ├── Prisma              — ORM (type-safe, migration ง่าย)
  ├── PostgreSQL 16       — database
  ├── pgvector            — vector search (semantic search)
  ├── MCP SDK (HTTP/SSE)  — Claude Code integration
  ├── JWT (jsonwebtoken)  — authentication
  ├── React + Vite        — dashboard frontend
  └── Docker              — deployment

CLI (npm package):
  ├── Commander.js        — parse commands
  ├── @clack/prompts      — interactive prompts
  └── TypeScript          — type checking
```

### ทำไมเลือก tech นี้?

```
Fastify (ไม่ใช่ Express)
  → เร็วกว่า Express 2-3x
  → มี validation built-in
  → Plugin ecosystem ดี

Prisma (ไม่ใช่ Drizzle/TypeORM)
  → Schema readable มาก
  → Migration ง่าย (prisma migrate)
  → Type-safe queries
  → GUI: prisma studio

PostgreSQL + pgvector (ไม่ใช่ SQLite + ChromaDB)
  → อยู่บน server = ข้ามเครื่องได้
  → pgvector = vector search ใน DB เดียวกัน
  → ไม่ต้องติดตั้ง ChromaDB แยก
  → Full-Text Search ดีกว่า SQLite

Node.js (ไม่ใช่ Bun)
  → ทุกคนมี Node.js อยู่แล้ว
  → Package ecosystem ใหญ่กว่า
  → Stable กว่า Bun
  → Deploy ง่ายกว่า
```

---

## แผนการทำงาน 4 Phases

### Phase 1: API Server (สัปดาห์ 1-2)

```
สัปดาห์ 1:
  วันที่ 1-2:
    ✅ Setup Debian: Node.js, PostgreSQL, pgvector
    ✅ สร้างโปรเจค kuraith/ (Fastify + TypeScript)
    ✅ เขียน Prisma schema (11 tables)
    ✅ Run migration

  วันที่ 3-4:
    ✅ สร้าง REST API (auth, documents, search)
    ✅ JWT authentication + API key system
    ✅ Hybrid Search engine (FTS + pgvector)

  วันที่ 5:
    ✅ สร้าง MCP Server (HTTP/SSE transport)
    ✅ เชื่อม MCP tools กับ REST API

สัปดาห์ 2:
  วันที่ 1-3:
    ✅ สร้าง 8 MCP tools
    ✅ ทดสอบกับ Claude Code (MCP connection)

  วันที่ 4-5:
    ✅ Docker + docker-compose
    ✅ Deploy บน Debian server
    ✅ ทดสอบ remote access (Mac → Server)
```

### Phase 2: Skills CLI (สัปดาห์ 2-3)

```
  วันที่ 1-2:
    ✅ สร้าง CLI (Commander.js)
    ✅ install/uninstall commands
    ✅ Agent detection (Claude, Codex, Gemini, GLM)

  วันที่ 3-5:
    ✅ เขียน 10 SKILL.md files
    ✅ ทดสอบทุก skill กับ Claude Code
    ✅ npm publish (kuraith-skills)
    ✅ สร้าง install.sh (curl | bash)
```

### Phase 3: Dashboard (สัปดาห์ 3-4)

```
  วันที่ 1-3:
    ✅ React + Vite setup
    ✅ 6 pages: Overview, Search, Sessions, Learnings, Activity, Settings

  วันที่ 4-5:
    ✅ Auth (login page)
    ✅ Deploy dashboard บน server
```

### Phase 4: Distribution (สัปดาห์ 4)

```
  วันที่ 1-2:
    ✅ จด domain kuraith.com
    ✅ SSL cert (Let's Encrypt)
    ✅ nginx reverse proxy

  วันที่ 3-5:
    ✅ Documentation site
    ✅ Getting started guide
    ✅ npm publish final version
```

---

## โครงสร้างไฟล์ทั้งหมด

```
kuraith/                              ← Repo 1: API Server
├── src/
│   ├── index.ts                      # Entry point
│   ├── server.ts                     # Fastify server (port 47700)
│   ├── mcp.ts                        # MCP Server (HTTP/SSE)
│   │
│   ├── db/                           # Database
│   │   └── seed.ts                   # Seed data
│   │
│   ├── tools/                        # 8 MCP Tools
│   │   ├── search.ts                 # kuraith_search
│   │   ├── learn.ts                  # kuraith_learn
│   │   ├── handoff.ts                # kuraith_handoff
│   │   ├── inbox.ts                  # kuraith_inbox
│   │   ├── reflect.ts                # kuraith_reflect
│   │   ├── stats.ts                  # kuraith_stats
│   │   ├── trace.ts                  # kuraith_trace
│   │   └── supersede.ts              # kuraith_supersede
│   │
│   ├── api/                          # REST API routes
│   │   ├── auth.ts                   # JWT + API keys
│   │   ├── documents.ts              # CRUD documents
│   │   ├── search.ts                 # Search endpoints
│   │   ├── sessions.ts               # Session management
│   │   └── dashboard.ts              # Dashboard data
│   │
│   └── services/                     # Business logic
│       ├── search.ts                 # Hybrid search engine
│       ├── indexer.ts                # Document indexer
│       └── embeddings.ts             # Vector embeddings
│
├── frontend/                         # React Dashboard
│   └── src/
│       ├── App.tsx
│       ├── pages/                    # 6 pages
│       └── components/
│
├── prisma/
│   └── schema.prisma                 # Database schema
│
├── Dockerfile
├── docker-compose.yml                # KURAITH + PostgreSQL
├── package.json
├── tsconfig.json
└── .env.example


kuraith-skills/                       ← Repo 2: Skills + CLI
├── src/
│   ├── cli/
│   │   ├── index.ts                  # CLI entry (Commander.js)
│   │   ├── installer.ts              # Install/uninstall logic
│   │   └── agents.ts                 # Agent registry (4 agents)
│   │
│   └── skills/
│       ├── recap/SKILL.md            # /recap
│       ├── learn/SKILL.md            # /learn
│       ├── rrr/SKILL.md              # /rrr
│       ├── forward/SKILL.md          # /forward
│       ├── standup/SKILL.md          # /standup
│       ├── trace/SKILL.md            # /trace
│       ├── who-are-you/SKILL.md      # /who-are-you
│       ├── feel/SKILL.md             # /feel
│       ├── philosophy/SKILL.md       # /philosophy
│       └── speak/SKILL.md            # /speak
│
├── install.sh                        # curl | bash installer
├── package.json                      # npm: kuraith-skills
└── tsconfig.json


kuraith-docs/                         ← Repo 3: Documentation
├── README.md
├── philosophy.md                     # ปรัชญา KURAITH
├── getting-started.md                # เริ่มต้นใช้งาน
├── skills-guide.md                   # สร้าง skill ใหม่
└── api-reference.md                  # API docs
```

---

## สรุป

```
KURAITH = ระบบความจำ + ชุดคำสั่ง สำหรับ AI coding agents

ทำให้ AI เปลี่ยนจาก:
  "ลืมทุกอย่างทุก session"
เป็น:
  "จำได้ เรียนรู้ ค้นหาได้ ส่งต่อได้ ข้ามเครื่องได้"

3 ส่วน:
  1. kuraith (API Server)     → สมอง
  2. kuraith-skills (CLI)     → ชุดคำสั่ง
  3. kuraith-docs (Docs)      → คู่มือ

10 คำสั่งหลัก:
  /recap /learn /rrr /forward /standup
  /trace /who-are-you /feel /philosophy /speak

ใช้ MacBook หรือ PC ก็เข้าถึงข้อมูลเดียวกัน
แจกคนอื่นได้: npx kuraith-skills install
```
