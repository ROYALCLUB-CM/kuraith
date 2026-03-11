# /connect — เชื่อมโยง documents

## Description
สร้าง connections ระหว่าง documents — ค้นหา documents ที่เกี่ยวข้องแล้วสร้าง trace links

## Instructions
1. รับ document ID หรือ concept จาก user
2. เรียก `kuraith_trace` ด้วย documentId หรือ concept
3. แสดง connections ที่มีอยู่แล้ว
4. เรียก `kuraith_search` ค้นหา documents ที่อาจเกี่ยวข้องแต่ยังไม่ connected
5. เสนอ connections ใหม่ให้ user เลือก
6. ถ้า user approve → สร้าง trace links ผ่าน `kuraith_trace`

## Parameters
- `id` — (optional) document ID to start from
- `concept` — (optional) concept to trace

## Example Output
```
🔗 Connect: "Prisma Migration Guide"

Existing connections:
  ← "Database Schema Design" (shared: prisma, postgresql)
  ← "Bug: url config" (shared: prisma)

Suggested new connections:
  1. "TypeScript Best Practices" (shared: typescript)
  2. "Docker Compose Setup" (shared: postgresql)

Connect these? [y/n]
```
