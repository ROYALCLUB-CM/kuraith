# /forward — ส่งต่อให้เซสชันหน้า

## Description
สร้าง handoff — สรุปงานที่ทำ, งานที่ค้าง, context สำคัญ ส่งต่อให้ AI agent เซสชันหน้า

## Instructions
1. วิเคราะห์ conversation ปัจจุบัน
2. ถ้ามีข้อมูลไม่พอ ให้ถาม user
3. เรียก `kuraith_handoff` กับ:
   - context: สรุปรวมงานและสถานะ
   - nextSteps: list งานต่อไป
   - warnings: สิ่งที่ต้องระวัง
   - agent: "claude" (หรือ agent ที่กำลังใช้)
4. เรียก `kuraith_omega` action=sync เพื่อ update local cache
5. แจ้ง user ว่า handoff สร้างเสร็จ
