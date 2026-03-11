import { prisma } from "../db/index.js";

export const reflectTool = {
  name: "kuraith_reflect",
  description:
    "Reflect on patterns and learnings. Analyzes stored knowledge to find recurring themes, common problems, and insights.",
  inputSchema: {
    type: "object" as const,
    properties: {
      project: { type: "string", description: "Filter by project" },
      days: { type: "number", description: "Look back N days (default 7)" },
    },
    required: [],
  },
};

export async function handleReflect(args: { project?: string; days?: number }, userId: string) {
  const days = args.days || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const where: any = { userId, createdAt: { gte: since } };
  if (args.project) where.project = args.project;

  const [documents, learnings, sessions, searches] = await Promise.all([
    prisma.document.findMany({
      where: { ...where, supersededBy: null },
      select: { type: true, concepts: true, project: true, stage: true },
    }),
    prisma.learning.findMany({
      where: { userId, createdAt: { gte: since } },
    }),
    prisma.session.findMany({
      where: { userId, startedAt: { gte: since } },
    }),
    prisma.searchLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { query: true },
    }),
  ]);

  // Count concepts
  const conceptCounts: Record<string, number> = {};
  for (const doc of documents) {
    for (const c of doc.concepts) {
      conceptCounts[c] = (conceptCounts[c] || 0) + 1;
    }
  }
  const topConcepts = Object.entries(conceptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Count document types
  const typeCounts: Record<string, number> = {};
  for (const doc of documents) {
    typeCounts[doc.type] = (typeCounts[doc.type] || 0) + 1;
  }

  // Top searches
  const searchCounts: Record<string, number> = {};
  for (const s of searches) {
    searchCounts[s.query] = (searchCounts[s.query] || 0) + 1;
  }
  const topSearches = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Count stages
  const stageCounts: Record<string, number> = {};
  for (const doc of documents) {
    const stage = (doc as any).stage || "raw";
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  }

  const text = `**Reflection** (last ${days} days)\n\n**Activity:**\n  Documents: ${documents.length}\n  Learnings: ${learnings.length}\n  Sessions: ${sessions.length}\n  Searches: ${searches.length}\n\n**Knowledge Pipeline:**\n  raw: ${stageCounts["raw"] || 0} | refined: ${stageCounts["refined"] || 0} | gem: ${stageCounts["gem"] || 0}\n\n**Top Concepts:**\n${topConcepts.map(([c, n]) => `  ${c}: ${n}`).join("\n") || "  None yet"}\n\n**Document Types:**\n${Object.entries(typeCounts).map(([t, n]) => `  ${t}: ${n}`).join("\n") || "  None yet"}\n\n**Top Searches:**\n${topSearches.map(([q, n]) => `  "${q}": ${n}x`).join("\n") || "  None yet"}\n\n**Learnings:**\n${learnings.map((l) => `  - ${l.title}`).join("\n") || "  None yet"}`;

  await prisma.activityLog.create({
    data: { userId, action: "reflect", details: `Reflection: ${days} days` },
  });

  return { content: [{ type: "text" as const, text }] };
}
