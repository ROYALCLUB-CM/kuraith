# /focus — ตั้ง focus สำหรับ session

## Description
ตั้งเป้าหมาย/โฟกัสสำหรับ session ปัจจุบัน บันทึกลง KURAITH เพื่อให้ agent จดจ่อกับงานที่กำหนด

## Instructions
1. ถาม user ว่าจะ focus อะไรใน session นี้ (ถ้ายังไม่บอก)
2. เรียก `kuraith_learn` บันทึก focus:
   - title: "Focus: [หัวข้อ]"
   - type: "session"
   - concepts: ["focus", "session", ...]
3. ถ้ามี active workflow → แสดง tasks ที่เกี่ยวข้อง
4. แนะนำขั้นตอนแรกที่ควรทำ

## Parameters
- `goal` — เป้าหมายของ session (required)
- `project` — (optional) ชื่อโปรเจค

## Example Output
```
🎯 Focus Set: "เพิ่ม Telegram Bot ให้ KURAITH"

Project: kuraith
Tasks:
  1. สร้าง telegram service
  2. เพิ่ม notification endpoints
  3. ทดสอบ

📝 Saved to KURAITH
→ เริ่มจาก task 1 เลยไหม?
```
