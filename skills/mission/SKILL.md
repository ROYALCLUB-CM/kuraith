# /mission — Mission Control สรุป

## Description
แสดงสรุป Mission Control — fleet status, active operations, communications ล่าสุด

## Instructions
1. เรียก `kuraith_stats` ดึงสถิติ
2. เรียก `kuraith_workflow` action=list ดึง workflows
3. เรียก `kuraith_inbox` ดู handoffs ล่าสุด
4. สรุปเป็น Mission Control view:
   - Agent fleet status (ใครทำงานอยู่)
   - Active workflows + progress
   - Communications ล่าสุด
5. ตอบเป็นภาษาไทย กระชับ

## Example Output
```
📡 Mission Control

Fleet: 1/17 agents active
  🟢 Claude Code — 2 sessions, 1 task

Operations: 1 workflow
  "Build Feature X" [75%]
  ├─ ✅ Backend API (Claude)
  ├─ 🔄 Frontend UI (Codex)
  └─ ⏳ Tests (Gemini)

Comms: 2 handoffs
  • Claude → next: 3 steps pending
  • Unknown → next: read

📊 Memory: 5 docs | Pipeline: raw 4, gem 1
```
