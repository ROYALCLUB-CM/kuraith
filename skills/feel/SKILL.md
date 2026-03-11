# /feel — บันทึกอารมณ์และพลังงาน

## Description
บันทึกอารมณ์และระดับพลังงานของ user ลง KURAITH

## Instructions
1. ถาม user: อารมณ์? พลังงาน (1-10)? มีอะไรอยากบอก?
2. เรียก `kuraith_learn` บันทึก:
   - type: "knowledge"
   - title: "Mood: YYYY-MM-DD HH:mm"
   - content: อารมณ์ + พลังงาน + notes
   - concepts: ["mood", "energy", อารมณ์ที่บอก]
   - stage: "raw"
3. ค้นหา mood ก่อนหน้าด้วย `kuraith_search` query="Mood" เปรียบเทียบ trend
