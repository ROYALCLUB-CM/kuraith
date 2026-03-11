# /trace — ค้นหาข้ามความจำ

## Description
ค้นหาความรู้ข้ามหลาย sources: KURAITH memory + codebase + git history

## Instructions
1. รับ query จาก user
2. เรียก `kuraith_search` ค้นจาก KURAITH memory (รองรับ stage filter)
3. ถ้ามี documentId ให้เรียก `kuraith_trace` เพื่อดู connections
4. ค้นจาก codebase ด้วย (Grep/Glob) ถ้าเกี่ยวข้อง
5. รวมผลลัพธ์ + แสดง stage ของแต่ละ document (raw/refined/gem)

## Parameters
- `query` — สิ่งที่ต้องการค้นหา
- `stage` — (optional) filter เฉพาะ stage: raw, refined, gem
