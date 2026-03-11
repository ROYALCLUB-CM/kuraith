# /review — ทบทวนและคัดกรองความรู้

## Description
ทบทวน documents ล่าสุดที่เป็น "raw" — เสนอให้ promote, merge, หรือ supersede

## Instructions
1. เรียก `kuraith_search` ดึง documents ที่ stage=raw (limit: 10, เรียงจากเก่าสุด)
2. สำหรับแต่ละ document:
   - วิเคราะห์คุณภาพ: concepts ครบไหม, เนื้อหาชัดเจนไหม
   - ตรวจว่ามี duplicate กับ document อื่นไหม
   - เสนอ action:
     - **promote** → refined (ถ้าคุณภาพดี)
     - **merge** → รวมกับ document อื่น (ถ้า duplicate)
     - **supersede** → แทนที่ด้วยเวอร์ชันใหม่ (ถ้า outdated)
     - **keep** → เก็บเป็น raw ไว้ก่อน
3. ถ้า user approve → ทำ action ด้วย MCP tools ที่เกี่ยวข้อง

## Example Output
```
📋 Review: 5 raw documents

1. "Prisma url config bug" (3 days old)
   Concepts: [prisma] | Quality: ★★★
   → Recommend: promote to refined ✓

2. "Quick note about testing" (5 days old)
   Concepts: [] | Quality: ★
   → Recommend: add concepts, then promote

3. "API rate limiting notes" (1 day old)
   Similar to: "Rate limit implementation" (refined)
   → Recommend: merge with existing

ดำเนินการตามที่แนะนำไหม?
```
