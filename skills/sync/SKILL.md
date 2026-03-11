# /sync — Sync omega structure

## Description
Sync ข้อมูลจาก KURAITH server ลง local omega/ directory

## Instructions
1. เรียก `kuraith_omega` action=sync
2. แสดงผลลัพธ์:
   - จำนวนไฟล์ที่ sync
   - Handoffs ใหม่
   - Learnings ใหม่
   - Sessions ล่าสุด
3. ถ้า omega/ ยังไม่มี → เรียก `kuraith_omega` action=init ก่อน

## Example Output
```
🔄 Omega Sync Complete

📂 omega/
  inbox/     2 handoffs (1 new)
  learnings/ 8 files
  sessions/  5 files
  KURAITH.md updated

Last sync: just now
```
