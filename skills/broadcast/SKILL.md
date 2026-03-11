# /broadcast — ส่งข้อความถึงทุก agent

## Description
ส่งข้อความ/คำสั่งถึง agents ทั้งหมดใน workflow ผ่าน KURAITH coordination system

## Instructions
1. ตรวจว่ามี active workflow ไหม
   - เรียก `kuraith_workflow` action=list
2. ถ้ามี workflow:
   - ถาม user ว่าจะส่งข้อความอะไร
   - เรียก `kuraith_coordinate` ส่ง broadcast (ไม่ระบุ toAgent = ส่งทุกคน)
3. ถ้าไม่มี workflow:
   - แจ้งว่ายังไม่มี workflow
   - เสนอให้สร้าง workflow ใหม่ด้วย /plan

## Parameters
- `message` — ข้อความที่จะ broadcast (required)
- `workflowId` — (optional) ระบุ workflow

## Example Output
```
📢 Broadcast to Workflow "Build Feature X":

Message: "All tasks should target TypeScript strict mode"

Sent to:
  ✓ Claude Code (Backend API)
  ✓ Codex (Frontend UI)
  ✓ Gemini CLI (Tests)

3 agents notified
```
