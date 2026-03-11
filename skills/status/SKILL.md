# /status — สถานะระบบ KURAITH

## Description
แสดงสถานะครบทุกด้าน — server, database, pipeline, workflows, omega

## Instructions
1. เรียก `kuraith_stats` → สถิติรวม
2. เรียก `kuraith_omega` action=status → สถานะ omega
3. แสดงครบทุกด้าน:
   - Server status
   - Database: documents, sessions, searches
   - Pipeline: raw/refined/gem
   - Active workflows + tasks
   - Omega sync status
   - Embedding status (enabled/disabled)

## Example Output
```
📡 KURAITH Status

Server: ● Online (localhost:47700)
MCP:    ● Online (localhost:47701)

📊 Database:
  Documents: 12 | Sessions: 5 | Searches: 42

🔬 Pipeline:
  ██████░░░░ raw: 8
  ████░░░░░░ refined: 3
  █░░░░░░░░░ gem: 1

🔄 Workflows: 1 active (3 tasks)
📂 Omega: synced (5m ago)
🧠 Embeddings: disabled (no OPENAI_API_KEY)
```
