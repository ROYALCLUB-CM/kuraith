# /speak — อ่านออกเสียง

## Description
อ่านข้อความออกเสียงผ่าน macOS `say` command หรือ text-to-speech อื่นๆ

## Instructions
1. รับข้อความจาก user
2. ตรวจสอบ platform:
   - macOS → ใช้ `say` command
   - Linux → ใช้ `espeak` หรือ `edge-tts`
3. เลือก voice ที่เหมาะกับภาษา:
   - อังกฤษ: `say -v Samantha -r 130 "text"`
   - ไทย: `say -v Kanya "text"` (ถ้ามี) หรือ edge-tts
4. พูดข้อความ

## Parameters
- `text` — ข้อความที่ต้องการอ่าน
- `voice` — (optional) ชื่อ voice
- `rate` — (optional) ความเร็ว (default 130)

## Example
User: `/speak KURAITH is ready`
→ `say -v Samantha -r 130 "KURAITH is ready"`
