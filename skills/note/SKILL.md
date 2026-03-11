# /note — จดบันทึกด่วน

## Description
จดบันทึกสั้นๆ ลง KURAITH โดยไม่ต้องกรอกรายละเอียดเยอะ — ใช้สำหรับจดเร็วๆ ระหว่างทำงาน

## Instructions
1. รับข้อความจาก user (argument)
2. เรียก `kuraith_learn` ทันที:
   - title: สรุปจาก note (auto-generate)
   - content: ข้อความเต็ม
   - type: "knowledge"
   - stage: "raw"
   - concepts: สกัดจากเนื้อหาอัตโนมัติ
3. ไม่ต้องถามอะไรเพิ่ม — จดเลย
4. แสดงยืนยันสั้นๆ

## Parameters
- `text` — ข้อความที่ต้องการจด (required)
- `project` — (optional) ชื่อโปรเจค

## Example Output
```
📌 Noted: "Prisma 7 breaks url config — stay on v6"
   Concepts: prisma, database, migration
   Stage: raw
```
