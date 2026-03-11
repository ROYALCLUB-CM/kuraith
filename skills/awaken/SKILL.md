# /awaken — เริ่มต้นเซสชันใหม่

## Description
ตรวจสอบ inbox, ดึง context จากเซสชันก่อนหน้า, sync omega, แล้วพร้อมเริ่มทำงาน
คำสั่งนี้รวม recap + omega sync + stats ไว้ในที่เดียว

## Instructions
1. เรียก `kuraith_inbox` ดึง handoff ล่าสุด
2. เรียก `kuraith_omega` action=sync เพื่อ sync ข้อมูล
3. เรียก `kuraith_stats` ดึงสถิติรวม (documents, pipeline, workflows)
4. ถ้ามี handoff:
   - แสดง context, nextSteps, warnings
   - ถ้ามี active workflow → แสดง task ที่ assign ให้ agent ปัจจุบัน
5. ถ้าไม่มี handoff:
   - แสดงสถิติรวมแทน
   - แนะนำว่าเริ่มจากตรงไหนดี
6. ตอบเป็นภาษาไทย สรุปกระชับ

## Example Output
```
☀ KURAITH Awaken — เซสชันใหม่

📥 Inbox: 1 handoff จาก claude (2 ชม. ที่แล้ว)
  Context: กำลังทำ Mission Control dashboard
  Next: 1. เพิ่ม agents 2. เพิ่ม skills
  ⚠ ระวัง: Prisma v6 only

📊 Stats: 5 docs | 2 sessions | pipeline: raw 4, refined 0, gem 1
🔄 Omega synced

พร้อมเริ่มทำงาน — มีอะไรให้ช่วย?
```
