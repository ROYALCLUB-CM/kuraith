import { prisma } from "../db/index.js";
import { randomBytes } from "node:crypto";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-3-small";

export function isEmbeddingEnabled(): boolean {
  return !!OPENAI_API_KEY;
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text.slice(0, 8000),
      }),
    });

    if (!res.ok) {
      console.error(`Embedding API error: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as any;
    return data.data[0].embedding;
  } catch (err) {
    console.error("Embedding error:", err);
    return null;
  }
}

export async function embedDocument(
  documentId: string,
  text: string
): Promise<boolean> {
  const embedding = await generateEmbedding(text);
  if (!embedding) return false;

  const id = randomBytes(12).toString("hex");
  const vectorStr = `[${embedding.join(",")}]`;

  await prisma.$executeRawUnsafe(
    `INSERT INTO document_vectors (id, document_id, embedding, created_at)
     VALUES ($1, $2, $3::vector, NOW())
     ON CONFLICT (document_id) DO UPDATE SET embedding = $3::vector`,
    id,
    documentId,
    vectorStr
  );

  return true;
}

export async function vectorSearch(
  query: string,
  userId: string,
  limit: number = 10,
  filters?: { type?: string; project?: string; stage?: string }
): Promise<any[]> {
  const embedding = await generateEmbedding(query);
  if (!embedding) return [];

  const vectorStr = `[${embedding.join(",")}]`;

  const conditions: string[] = [
    `d.user_id = $2`,
    `d.superseded_by IS NULL`,
  ];
  const params: any[] = [vectorStr, userId];
  let paramIdx = 3;

  if (filters?.type) {
    conditions.push(`d.type = $${paramIdx}`);
    params.push(filters.type);
    paramIdx++;
  }
  if (filters?.project) {
    conditions.push(`d.project = $${paramIdx}`);
    params.push(filters.project);
    paramIdx++;
  }
  if (filters?.stage) {
    conditions.push(`d.stage = $${paramIdx}`);
    params.push(filters.stage);
    paramIdx++;
  }

  params.push(limit);
  const limitParam = `$${paramIdx}`;
  const whereSQL = conditions.join(" AND ");

  return prisma.$queryRawUnsafe<any[]>(
    `SELECT d.id, d.title, d.content, d.type, d.concepts, d.project, d.stage,
            d.created_at as "createdAt",
            1 - (dv.embedding <=> $1::vector) as similarity
     FROM documents d
     JOIN document_vectors dv ON dv.document_id = d.id
     WHERE ${whereSQL}
     ORDER BY dv.embedding <=> $1::vector
     LIMIT ${limitParam}`,
    ...params
  );
}
