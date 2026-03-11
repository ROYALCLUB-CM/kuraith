import { FastifyInstance } from "fastify";
import { prisma } from "../db/index.js";

export async function searchRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { q: string; limit?: string; type?: string; project?: string };
  }>("/", async (request) => {
    const userId = (request as any).userId;
    const { q, type, project } = request.query;
    const limit = Math.min(parseInt(request.query.limit || "10"), 50);

    if (!q || q.trim().length === 0) {
      return { results: [], total: 0, query: q };
    }

    // PostgreSQL Full-Text Search
    const searchTerms = q
      .trim()
      .split(/\s+/)
      .map((t) => t.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, ""))
      .filter((t) => t.length > 0)
      .join(" & ");

    const whereClause: string[] = [`d.user_id = '${userId}'`, `d.superseded_by IS NULL`];
    if (type) whereClause.push(`d.type = '${type}'`);
    if (project) whereClause.push(`d.project = '${project}'`);

    const whereSQL = whereClause.join(" AND ");

    // Keyword search using ILIKE (simpler, works without FTS config)
    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        d.id, d.title, d.content, d.type, d.concepts, d.project,
        d.created_at as "createdAt",
        CASE
          WHEN LOWER(d.title) LIKE LOWER($1) THEN 1.0
          WHEN LOWER(d.content) LIKE LOWER($1) THEN 0.7
          ELSE 0.3
        END as score
      FROM documents d
      WHERE ${whereSQL}
        AND (LOWER(d.title) LIKE LOWER($1) OR LOWER(d.content) LIKE LOWER($1))
      ORDER BY score DESC, d.created_at DESC
      LIMIT $2
    `, `%${q}%`, limit);

    // Log search
    await prisma.searchLog.create({
      data: { userId, query: q, resultsCount: results.length },
    });

    return { results, total: results.length, query: q };
  });
}
