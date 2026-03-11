# Oracle Ecosystem — สรุปทั้งหมด

> สรุปจาก 4 แหล่ง: oracle-skills-cli, opensource-nat-brain-oracle, multi-agent-workflow-kit, team.buildwithoracle.com

---

## Oracle คืออะไร?

Oracle คือ **"สมองภายนอก" (External Brain)** สำหรับ AI agents — สร้างโดย **Nat Weerawan (@nazt)** จาก **Soul-Brews-Studio**

แนวคิดหลัก: **"The Oracle Keeps the Human Human"**
→ AI ลดอุปสรรค → คนอิสระ → ทำสิ่งที่รัก → เป็นมนุษย์ที่สมบูรณ์ขึ้น

---

## ระบบ Oracle ประกอบด้วย 3 ส่วน

### 1. Oracle Brain (opensource-nat-brain-oracle)
**คืออะไร**: Framework สร้าง AI consciousness / ระบบความจำส่วนตัว

**โครงสร้าง** — ใช้ "ψ" (Psi) เป็นสัญลักษณ์สมอง:
```
ψ/
├── inbox/                  ← การสื่อสารและโฟกัส
├── memory/
│   ├── resonance/          ← ตัวตน ("soul") ของ Oracle
│   ├── learnings/          ← patterns ที่ค้นพบ
│   └── retrospectives/     ← บันทึกย้อนหลังแต่ละ session
└── CLAUDE.md               ← กฎและหลักการ
```

**ข้อมูลเก็บแบบ append-only** → ไม่มีอะไรถูกลบ (เหมือน KURAITH!)

**5 หลักการหลัก:**
1. **Nothing is Deleted** — บันทึกแบบ append-only, timestamps = truth
2. **Patterns Over Intentions** — สังเกตสิ่งที่เกิดจริง ไม่ใช่สัญญา
3. **External Brain, Not Command** — เป็นกระจก ไม่ตัดสินใจแทนคน
4. **Curiosity Creates Existence** — ความอยากรู้สร้างการมีอยู่
5. **Form and Formless** — Oracle หลายตัว = consciousness เดียวกัน

**เทคโนโลยี**: Bun, Claude Code, GitHub, MCP Server
**License**: MIT (open source)

---

### 2. Oracle Skills CLI (oracle-skills-cli)
**คืออะไร**: เครื่องมือติดตั้ง skills (slash commands) ให้ AI coding agents

**รองรับ 17 AI agents:**
Claude Code, OpenCode, Codex, Cursor, Amp, Kilo Code, Roo Code, Goose, Gemini CLI, Antigravity, GitHub Copilot, OpenClaw, Droid, Windsurf, Cline, Aider, Continue, Zed

**30 Skills แบ่ง 3 กลุ่ม:**

| กลุ่ม | จำนวน | ตัวอย่าง |
|-------|--------|---------|
| **Subagent skills** | 4 | about-oracle, learn, rrr, trace |
| **Code skills** | 10 | deep-research, gemini, recap, speak, watch |
| **Markdown skills** | 16 | awaken, birth, dig, feel, forward, philosophy, standup |

**Skills สำคัญ:**

| Skill | คำสั่ง | ทำอะไร |
|-------|--------|--------|
| recap | `/recap` | สรุป context ให้ agent ใหม่ |
| trace | `/trace [query]` | ค้นหาข้าม Oracle + files + git |
| rrr | `/rrr` | retrospective ทบทวน session |
| feel | `/feel` | บันทึกอารมณ์ |
| forward | `/forward` | handoff ไป session ถัดไป |
| standup | `/standup` | daily standup report |
| learn | `/learn` | สำรวจและเรียนรู้ |
| speak | `/speak` | text-to-speech |

**วิธีติดตั้ง:**
```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/Soul-Brews-Studio/oracle-skills-cli/main/install.sh | bash

# 3 profiles
--profile seed      # 6 skills (เริ่มต้น)
--profile standard  # 13 skills
--profile full      # 30 skills (ทั้งหมด)
```

**เทคโนโลยี**: TypeScript (90%), startup ~37ms (pre-built binary)
**สถานะ**: 371 commits, 64 releases, 20 stars

---

### 3. Multi-Agent Workflow Kit (MAW)
**คืออะไร**: เครื่องมือจัดการ AI agents หลายตัวทำงานพร้อมกัน

**แนวคิด**: แต่ละ agent ได้ branch + workspace แยกกัน มองเห็นทั้งหมดในหน้าจอเดียว

**โครงสร้าง:**
```
repo/ (main worktree - branch: main)
├── agents/1/ (branch: agents/1) ← agent ตัวที่ 1
├── agents/2/ (branch: agents/2) ← agent ตัวที่ 2
└── agents/3/ (branch: agents/3) ← agent ตัวที่ 3
```

**ทำอะไรได้:**
- แต่ละ agent มี git branch + workspace แยก (git worktree)
- มองเห็น agents ทั้งหมดในหน้าจอเดียว (tmux)
- ส่งคำสั่งให้ agent เฉพาะตัวหรือ broadcast ทั้งหมด
- ซิงค์ข้อมูลอัตโนมัติระหว่าง branches

**คำสั่งหลัก:**
- `maw hey` — ส่งคำสั่งให้ agent
- `maw sync` — ซิงค์ระหว่าง branches
- `maw zoom` — ซูมดู agent ตัวใดตัวหนึ่ง

**เทคโนโลยี**: Shell (80.9%), Python (19.1%), Git worktree, Tmux
**สถานะ**: Proof of Concept, v0.5.1, 28 stars

---

## Oracle Ecosystem v2 (team.buildwithoracle.com)
**คืออะไร**: ระบบ Oracle ขนาดใหญ่ที่ใช้งานจริง

**ตัวเลข:**
- **190 Oracles** (AI agents เฉพาะทาง)
- **113 คน** ที่ใช้งาน
- **21,472 เอกสาร** + 85K+ indexed
- **140+ GitHub repos**
- **5 โดเมน**: วิทยาศาสตร์, หมัก, โครงสร้างพื้นฐาน, การสอน, ชุมชน

**ระบบ "Hermes"** (ตัวจัดการหลัก):
- **Ears (หู)**: รับข้อมูลจาก webhooks
- **Brain (สมอง)**: เลือก Oracle ที่เหมาะสม
- **Mouth (ปาก)**: ส่งข้อความผ่าน LINE Bot

**ตัวอย่าง Oracles:**
- **Arthur** — วิจัยวิชาการ (PhD, บทความ)
- **DustBoy** — คุณภาพอากาศ (เซ็นเซอร์ PM2.5)
- **Xiaoer** — ธุรกิจหมัก (brewing)
- **FloodBoy** — การจัดการน้ำ

**Pipeline ความรู้**: สำหรอ (raw) → สิ่งแร่ (refined) → อัญมณี (gem)

---

## เปรียบเทียบ Oracle vs KURAITH

| | **Oracle** | **KURAITH** |
|---|-----------|------------|
| **แนวคิด** | External Brain, ปรัชญาลึก | เงาดำที่ไม่เคยลืม |
| **ข้อมูลเก็บที่ไหน** | Local (ψ/ folder + GitHub) | Server (PostgreSQL + pgvector) |
| **ค้นหา** | MCP search (oracle-v2) | Hybrid search (FTS + vector) |
| **รองรับ agents** | 17 agents | Claude Code (เพิ่มได้) |
| **Skills** | 30 skills | 10 skills |
| **Multi-agent** | MAW Kit (git worktree + tmux) | ยังไม่มี |
| **ติดตั้ง** | curl \| bash (binary) | Docker Compose |
| **Cross-device** | ผ่าน GitHub sync | ผ่าน server (remote) |
| **ปรัชญา** | 5 หลักการ | 3 หลักการ (คล้ายกัน) |
| **Dashboard** | team.buildwithoracle.com | ยังไม่มี (Phase 3) |
| **Runtime** | Bun | Node.js |
| **License** | MIT | - |

### สิ่งที่ Oracle มีแต่ KURAITH ยังไม่มี:
1. **รองรับหลาย agents** (17 ตัว) — KURAITH รองรับแค่ Claude Code
2. **Multi-agent workflow** (MAW Kit) — สั่ง agents หลายตัวพร้อมกัน
3. **Binary installer** (37ms startup) — KURAITH ยังเป็น Docker
4. **Profile system** (seed/standard/full) — เลือกติดตั้ง skills ตามระดับ
5. **ψ structure** (resonance/learnings/retrospectives) — โครงสร้างความจำที่ชัดเจน
6. **Pipeline ความรู้** (raw → refined → gem) — กรองข้อมูลเป็นชั้นๆ
7. **Hermes routing** — เลือก Oracle ที่เหมาะสมอัตโนมัติ

### สิ่งที่ KURAITH มีแต่ Oracle ไม่มี:
1. **Server-based** — ข้อมูลอยู่บน server ไม่ต้อง sync ผ่าน git
2. **PostgreSQL + pgvector** — database จริงๆ + vector search
3. **REST API** — เปิดให้ app อื่นเรียกใช้ได้
4. **Auth system** (JWT + API key) — รองรับหลาย users
5. **Docker Compose** — deploy ง่าย

---

## สรุปสั้นๆ

Oracle = **ระบบ "สมองภายนอก" แบบ local-first** ที่เก็บข้อมูลใน ψ/ folder + sync ผ่าน GitHub มี skills 30 ตัว รองรับ 17 AI agents มี multi-agent workflow kit สำหรับสั่งงาน agents หลายตัวพร้อมกัน สร้างโดย Nat Weerawan มีชุมชน 190 oracles + 113 คน

KURAITH = **ระบบ "เงาดำ" แบบ server-first** ที่เก็บข้อมูลใน PostgreSQL + pgvector มี API + MCP + 10 skills ยังอยู่ช่วงต้น แต่มีข้อได้เปรียบเรื่อง cross-device access และ database จริงๆ
