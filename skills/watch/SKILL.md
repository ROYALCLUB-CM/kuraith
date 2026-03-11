# /watch — ติดตามการเปลี่ยนแปลง

## Description
สแกน codebase หรือโปรเจคปัจจุบัน ตรวจจับการเปลี่ยนแปลงที่สำคัญ เทียบกับ KURAITH memory แล้วแจ้งเตือน

## Instructions
1. ตรวจสอบสถานะปัจจุบัน:
   - `git status` + `git log --oneline -10` (ถ้ามี git)
   - ดู files ที่เปลี่ยนแปลงล่าสุด
2. เรียก `kuraith_search` ค้นหา documents ที่เกี่ยวกับโปรเจคปัจจุบัน
3. เปรียบเทียบ:
   - มี patterns/bugs ที่เคยจดไว้เกี่ยวกับไฟล์ที่เปลี่ยนไหม?
   - มี warnings จาก handoff ล่าสุดที่เกี่ยวข้องไหม?
4. ถ้าพบสิ่งที่ควรระวัง → แจ้งเตือน
5. ถ้าพบ patterns ใหม่ → เสนอให้ learn

## Parameters
- `project` — (optional) ชื่อโปรเจค (default: ตรวจจากชื่อ folder)
- `scope` — (optional) files | git | all (default: all)

## Example Output
```
👁 Watch Report: kuraith/

📋 Git Status:
  Branch: main (3 commits ahead of origin)
  Modified: 4 files
  Untracked: 2 files

🔍 Related Knowledge:
  - "Prisma 6 only — v7 breaks url config" [gem] ← relevant to schema.prisma
  - "Rate limit should be 100/min for API" [refined]

⚠ Alerts:
  - package.json changed — check if dependencies match known patterns
  - No tests for 2 new files

✅ No conflicts with known patterns
```
