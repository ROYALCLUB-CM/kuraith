# /learn — เรียนรู้และจดจำ

## Description
สำรวจ codebase, URL, หรือข้อมูลที่ user ให้มา แล้วสรุปเป็นความรู้จดบันทึกลง KURAITH

## Instructions
1. ถ้า user ให้ URL → ใช้ WebFetch อ่านเนื้อหา
2. ถ้า user ให้ path → อ่านไฟล์/โฟลเดอร์
3. ถ้า user บอกข้อมูลตรงๆ → สรุปจากที่บอก
4. สรุปสาระสำคัญ ใส่ concepts ที่เกี่ยวข้อง
5. เรียก MCP tool `kuraith_learn` เพื่อจดบันทึก (stage เริ่มที่ "raw")
6. ถ้าเป็นความรู้ที่มั่นใจสูง ให้ใช้ stage="refined"
7. แจ้ง user ว่าจำแล้ว + บอก stage

## Parameters
- `source` — URL, file path, or inline text
- `project` — (optional) ชื่อโปรเจค
- `stage` — (optional) raw | refined | gem
