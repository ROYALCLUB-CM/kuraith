# /recap — สรุปจากเซสชันที่แล้ว

## Description
ดึง handoff ล่าสุดจาก KURAITH แล้วสรุปให้ user ว่าเมื่อวานทำอะไรค้างไว้ ต้องทำอะไรต่อ

## Instructions
1. เรียก MCP tool `kuraith_inbox` เพื่อดึง handoff ล่าสุด
2. ถ้ามี handoff ให้สรุปเป็น bullet points:
   - งานที่ทำไปแล้ว (context) + agent ที่ทำ
   - งานที่ต้องทำต่อ (nextSteps)
   - สิ่งที่ต้องระวัง (warnings)
3. ถ้าไม่มี handoff ให้เรียก `kuraith_stats` แสดงสถานะทั่วไป (รวม pipeline + workflow)
4. เรียก `kuraith_omega` action=sync เพื่อ sync ข้อมูลล่าสุดลง local
5. ตอบเป็นภาษาไทย สั้นกระชับ

## Example Output
```
🔄 สรุปจากเซสชันที่แล้ว (from: claude):

งานที่ทำไป:
  - สร้าง Dashboard 6 หน้า
  - เพิ่ม 4 MCP tools ใหม่

ต้องทำต่อ:
  1. Deploy บน Debian server
  2. ทดสอบ Dashboard

⚠ ระวัง:
  - Prisma 7 มี breaking changes ให้ใช้ v6

📊 Pipeline: raw 4 | refined 1 | gem 1
🔄 Omega synced
```
