# /goodbye — จบ session อย่างเรียบร้อย

## Description
ปิด session ปัจจุบัน — สร้าง handoff, sync omega, บันทึกสิ่งที่ทำ ตรงข้ามกับ /awaken

## Instructions
1. วิเคราะห์ conversation ปัจจุบัน สรุปสิ่งที่ทำ
2. ถ้ามีข้อมูลไม่พอ → ถาม user สั้นๆ
3. เรียก `kuraith_handoff`:
   - context: สรุปงานที่ทำทั้ง session
   - nextSteps: งานที่ต้องทำต่อ
   - warnings: สิ่งที่ต้องระวัง
   - agent: agent ปัจจุบัน
4. เรียก `kuraith_omega` action=sync → sync ข้อมูลล่าสุด
5. แสดงสรุปสั้นๆ ว่า session จบแล้ว
6. ถ้ามี active workflow → อัพเดต task status

## Example Output
```
👋 KURAITH — Session Closed

📝 Handoff created:
  Context: เพิ่ม 15 skills + Telegram Bot
  Next:
    1. Deploy to production
    2. ทดสอบ Telegram notifications
  ⚠ ระวัง: ต้องตั้ง TELEGRAM_BOT_TOKEN

🔄 Omega synced
📊 Session: 2h 15m | 8 learns | 3 searches

See you next session — /awaken เพื่อกลับมา
```
