# /deep-research — วิจัยเชิงลึก

## Description
ค้นหาข้อมูลจากหลายแหล่ง (KURAITH memory + web + codebase) แล้วสรุปเป็น research report จดบันทึกผลลัพธ์ลง KURAITH

## Instructions
1. รับ topic จาก user
2. **Phase 1: Internal Search** — ค้นใน KURAITH memory
   - เรียก `kuraith_search` ด้วย topic (limit: 20)
   - เรียก `kuraith_trace` ด้วย concepts ที่เกี่ยวข้อง
3. **Phase 2: Codebase Search** — ค้นใน codebase ปัจจุบัน
   - ค้นหา files, functions, patterns ที่เกี่ยวข้อง
   - วิเคราะห์ implementation details
4. **Phase 3: Web Research** — ค้นจาก internet
   - ค้นหา documentation, articles, best practices
   - เปรียบเทียบ approaches
5. **Phase 4: Synthesis** — สรุปรวม
   - รวมข้อมูลจากทุกแหล่ง
   - สรุปเป็น report: findings, recommendations, next steps
6. **Phase 5: Store** — จดบันทึก
   - เรียก `kuraith_learn` บันทึก research report (type: knowledge, stage: refined)
   - ใส่ concepts ที่เกี่ยวข้อง

## Parameters
- `topic` — หัวข้อวิจัย (required)
- `project` — (optional) ชื่อโปรเจค

## Example Output
```
🔬 Deep Research: "vector search optimization"

━━━ Phase 1: KURAITH Memory ━━━
  Found 2 related documents
  - DocumentVector schema uses pgvector(1536)
  - Current search uses ILIKE fallback

━━━ Phase 2: Codebase ━━━
  - src/services/embeddings.ts: OpenAI text-embedding-3-small
  - src/tools/search.ts: hybrid search (keyword + vector)

━━━ Phase 3: Web ━━━
  - pgvector supports HNSW index (faster for >1M vectors)
  - text-embedding-3-small: 1536 dims, $0.02/1M tokens
  - Alternative: Cohere embed-v3 (1024 dims, free tier)

━━━ Synthesis ━━━
  Findings:
    1. Current implementation is functional but unoptimized
    2. HNSW index would improve search speed 10-100x
    3. Lower-dimension models could reduce storage

  Recommendations:
    1. Add HNSW index: CREATE INDEX ON document_vectors USING hnsw(embedding vector_cosine_ops)
    2. Consider batch embedding on import
    3. Add embedding cache to avoid re-embedding

📝 Saved to KURAITH as "Research: vector search optimization" [refined]
```
