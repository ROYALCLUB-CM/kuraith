# /birth — สร้าง KURAITH setup ใหม่

## Description
ตั้งค่า KURAITH สำหรับโปรเจค/เครื่องใหม่ — สร้าง omega structure, ติดตั้ง skills, ตรวจสอบ connection

## Instructions
1. ตรวจสอบว่า KURAITH server เข้าถึงได้ไหม
   - เรียก `kuraith_stats` เพื่อ test connection
2. สร้าง omega structure
   - เรียก `kuraith_omega` action=init
3. Sync ข้อมูลจาก server
   - เรียก `kuraith_omega` action=sync
4. ตรวจสอบ skills ที่ติดตั้ง
   - แสดง list skills ที่พร้อมใช้
5. สร้าง handoff เปิด session แรก
   - เรียก `kuraith_learn` บันทึกว่า setup เสร็จ + ข้อมูลเครื่อง/โปรเจค
6. แสดงสรุปว่าพร้อมใช้งาน

## Parameters
- `project` — (optional) ชื่อโปรเจค
- `profile` — (optional) seed | standard | full

## Example Output
```
🌱 KURAITH Birth — Setup Complete

✅ Server: connected (localhost:47701)
✅ Omega: initialized at ./omega/
✅ Sync: 5 docs, 2 handoffs pulled
✅ Skills: 15 skills installed (full profile)

📝 Recorded: "KURAITH setup on macOS — project: kuraith" [raw]

omega/
├── inbox/          (2 pending handoffs)
├── memory/
│   ├── soul/       (KURAITH.soul.md)
│   ├── learnings/  (5 files)
│   └── sessions/   (2 files)
└── KURAITH.md

พร้อมใช้งาน — ลอง /recap เพื่อดู context ล่าสุด
```
