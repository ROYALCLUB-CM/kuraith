# /plan — สร้าง workflow สำหรับหลาย agents

## Description
ออกแบบและสร้าง multi-agent workflow — กำหนด tasks, assign agents, ตั้ง branches

## Instructions
1. ถาม user ว่าต้องการทำอะไร (ถ้ายังไม่บอก)
2. วิเคราะห์งานและแบ่งเป็น tasks:
   - แต่ละ task ควรทำได้อิสระ (parallel)
   - กำหนด agent ที่เหมาะสม
   - กำหนด branch name
3. แสดง plan ให้ user review
4. ถ้า user approve → เรียก `kuraith_workflow` action=create
5. แสดง workflow ID และขั้นตอนถัดไป

## Parameters
- `goal` — เป้าหมายของ workflow (required)
- `project` — (optional) ชื่อโปรเจค

## Example Output
```
📝 Workflow Plan: "Add Authentication System"

Tasks:
  1. 🔵 Claude Code → Backend auth routes
     Branch: feat/auth-api
  2. 🟢 Codex → Frontend login page
     Branch: feat/auth-ui
  3. 🔵 Gemini CLI → Auth integration tests
     Branch: feat/auth-tests

สร้าง workflow นี้ไหม? [y/n]

✅ Workflow created (ID: cmm...)
→ แต่ละ agent ใช้ /awaken เพื่อเริ่มทำ task
```
