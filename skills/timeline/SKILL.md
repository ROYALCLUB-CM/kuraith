# /timeline — แสดง activity timeline

## Description
แสดงไทม์ไลน์กิจกรรมทั้งหมด — learns, searches, handoffs, refines เรียงตามเวลา

## Instructions
1. เรียก `kuraith_stats` ดึงข้อมูลรวม
2. เรียก `kuraith_search` ด้วย query ว่าง หรือ recent documents
3. เรียก `kuraith_inbox` ดู handoffs ล่าสุด
4. รวมทั้งหมดเป็น timeline เรียงตามเวลา
5. แสดง format:
   - เวลา | action | รายละเอียด
   - Group ตามวัน

## Parameters
- `days` — (optional) look back N days (default: 7)
- `project` — (optional) filter by project

## Example Output
```
📅 Timeline (7 วัน):

━━━ Today ━━━
  12:30  learn     "Telegram Bot Integration" [raw]
  12:15  search    "telegram api" → 0 results
  11:00  refine    "Prisma Guide" raw → refined
  10:30  handoff   Claude → next session (3 steps)

━━━ Yesterday ━━━
  18:00  learn     "Mission Control Design" [raw]
  15:30  search    "agent fleet" → 2 results
  14:00  workflow  Created "Build Feature X"

Total: 15 activities
```
