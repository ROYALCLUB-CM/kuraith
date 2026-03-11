# /about — เกี่ยวกับ KURAITH

## Description
แสดงข้อมูลระบบ KURAITH — เวอร์ชัน, สถิติ, agents ที่รองรับ, skills ที่ติดตั้ง

## Instructions
1. เรียก `kuraith_stats` ดึงสถิติรวม
2. แสดงข้อมูล:
   - ชื่อ: KURAITH (黒+Wraith = เงาดำ)
   - Version: 1.0.0
   - จำนวน documents, sessions, learnings
   - Pipeline: raw/refined/gem
   - Agents ที่รองรับ (17 agents)
   - Skills ที่ติดตั้ง
   - MCP Tools (12 tools)
3. ตอบเป็นภาษาไทย

## Example Output
```
╔══════════════════════════════════════╗
║  KURAITH — เงาที่ไม่เคยลืม            ║
╚══════════════════════════════════════╝

Version: 1.0.0
Runtime: Node.js 22 + PostgreSQL 16

📊 Stats:
  Documents: 12 | Sessions: 5 | Learnings: 8
  Pipeline: raw 8 | refined 3 | gem 1
  Searches: 42

🤖 17 Agents | 15 Skills | 12 MCP Tools
🌐 Server: localhost:47700 | MCP: localhost:47701
```
