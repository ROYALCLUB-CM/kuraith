# /export — ส่งออกความรู้เป็น markdown

## Description
ส่งออก documents จาก KURAITH เป็นไฟล์ markdown — เลือกได้ตาม project, type, stage

## Instructions
1. ถาม user ว่าต้องการ export อะไร:
   - ทั้งหมด, เฉพาะ project, เฉพาะ stage (gem only), เฉพาะ type
2. เรียก `kuraith_search` ดึง documents ตาม filter
3. สร้างไฟล์ markdown:
   - ชื่อไฟล์: `kuraith-export-[date].md`
   - แต่ละ document มี: title, type, stage, concepts, content
4. เขียนไฟล์ลง directory ปัจจุบัน
5. แจ้ง user ว่าสร้างเสร็จ

## Parameters
- `project` — (optional) filter by project
- `stage` — (optional) raw | refined | gem
- `type` — (optional) knowledge | decision | pattern | bug

## Example Output
```
📤 Export: 5 documents → kuraith-export-2026-03-11.md

Included:
  • 2 knowledge [gem]
  • 2 patterns [refined]
  • 1 decision [raw]

File: ./kuraith-export-2026-03-11.md (3.2KB)
```
