# /reflect — สะท้อนความคิดจาก patterns

## Description
วิเคราะห์ patterns และ learnings ที่สะสมมา หาข้อเชื่อมโยง แนวโน้ม และ insights

## Instructions
1. เรียก `kuraith_reflect` เพื่อวิเคราะห์ patterns (7 วันล่าสุด)
2. เรียก `kuraith_search` ค้นหา documents ที่เป็น type "pattern"
3. วิเคราะห์:
   - Recurring themes — หัวข้อที่เจอบ่อย
   - Connections — ความเชื่อมโยงระหว่าง learnings
   - Gaps — อะไรที่ขาดหายไป
   - Trends — แนวโน้มที่เห็น
4. ถ้าพบ insight ใหม่ → เสนอให้ learn ลง KURAITH
5. สรุปเป็นภาษาไทย

## Parameters
- `project` — (optional) filter by project
- `days` — (optional) look back N days (default: 7)

## Example Output
```
🔮 Reflection (7 วัน):

Recurring Themes:
  • prisma/database — เจอ 5 ครั้ง
  • testing — เจอ 3 ครั้ง

Connections:
  prisma ↔ typescript ↔ fastify (strong)
  testing ↔ vitest (emerging)

Insights:
  💡 "Database-related bugs มักเกิดจาก migration ที่ไม่ sync"
  💡 "Test coverage เพิ่มขึ้นหลังเริ่มใช้ vitest"

Pipeline: raw 4 | refined 2 | gem 1

บันทึก insights เหล่านี้ไหม?
```
