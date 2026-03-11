# /dig — ขุดลึกเข้าไปใน topic

## Description
ค้นหาเชิงลึกใน KURAITH memory เกี่ยวกับ topic ที่ระบุ — trace connections, ดึง related documents, สรุปเป็นภาพรวม

## Instructions
1. รับ topic จาก user (argument หรือถาม)
2. เรียก `kuraith_search` ด้วย topic นั้น (limit: 20)
3. ถ้าพบ document ที่เกี่ยวข้อง:
   - เรียก `kuraith_trace` ด้วย concept จาก document ที่เจอ
   - สรุป connections ระหว่าง documents
4. เรียก `kuraith_search` อีกครั้งด้วย concepts ที่ค้นพบจาก trace
5. สรุปทั้งหมดเป็น:
   - ความรู้ที่มีเกี่ยวกับ topic
   - Connections กับ topics อื่น
   - Gaps — อะไรที่ยังไม่รู้
6. ถ้า user ต้องการ → เรียก `kuraith_learn` จดบันทึกสิ่งที่ค้นพบ

## Parameters
- `topic` — หัวข้อที่ต้องการค้นหา (required)

## Example Output
```
⛏ Dig: "prisma"

📄 พบ 3 documents:
  1. Prisma 6 Migration Guide [refined]
  2. Database Schema Design [raw]
  3. Bug: Prisma url config [gem]

🔗 Connections:
  prisma → postgresql → pgvector → embeddings
  prisma → typescript → fastify

🕳 Gaps:
  - ไม่มีข้อมูลเกี่ยวกับ Prisma Accelerate
  - ไม่มี performance benchmarks

บันทึกสรุปนี้ลง KURAITH ไหม?
```
