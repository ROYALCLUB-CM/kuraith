# /promote — เลื่อน stage ของ document

## Description
เลื่อน document ผ่าน Knowledge Pipeline: raw → refined → gem

## Instructions
1. ถ้า user ระบุ document ID → ใช้เลย
2. ถ้าไม่ระบุ → เรียก `kuraith_search` แสดง documents ที่เป็น raw/refined ให้เลือก
3. เรียก `kuraith_refine` เพื่อ promote:
   - raw → refined: ต้องมี concepts ครบ, เนื้อหาชัดเจน
   - refined → gem: ต้องเป็น pattern ที่ยืนยันแล้ว, ค่าสูง
4. ใส่ notes อธิบายว่าทำไมถึง promote
5. แสดงผลลัพธ์

## Parameters
- `id` — (optional) document ID
- `to` — (optional) refined | gem

## Example Output
```
⬆ Promote: "Prisma Migration Guide"
  raw → refined

Notes: "ตรวจสอบแล้ว ข้อมูลถูกต้อง มี concepts ครบ"

✅ Promoted successfully
  Stage: refined
  Pipeline: raw 3 | refined 3 | gem 1
```
