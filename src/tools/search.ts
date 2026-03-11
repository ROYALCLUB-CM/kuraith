import { prisma } from "../db/index.js";
import { isEmbeddingEnabled, vectorSearch } from "../services/embeddings.js";

export const searchTool = {
  name: "kuraith_search",
  description:
    "Search KURAITH memory for knowledge, patterns, decisions, and learnings. Use this to find relevant context before starting work.",
  inputSchema: {
    type: "object" as const,
    properties: {
      query: { type: "string", description: "Search query" },
      type: {
        type: "string",
        description: "Filter by type: knowledge, decision, pattern, bug, session",
        enum: ["knowledge", "decision", "pattern", "bug", "session"],
      },
      project: { type: "string", description: "Filter by project name" },
      limit: { type: "number", description: "Max results (default 10)" },
    },
    required: ["query"],
  },
};

export async function handleSearch(args: {
  query: string;
  type?: string;
  project?: string;
  limit?: number;
  stage?: string;
}, userId: string) {
  const limit = Math.min(args.limit || 10, 50);
  const query = args.query;

  const where: any = {
    userId,
    supersededBy: null,
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
      { concepts: { hasSome: [query.toLowerCase()] } },
    ],
  };

  if (args.type) where.type = args.type;
  if (args.project) where.project = args.project;
  if (args.stage) where.stage = args.stage;

  let results = await prisma.document.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      content: true,
      type: true,
      concepts: true,
      project: true,
      stage: true,
      createdAt: true,
    },
  });

  // Augment with vector search if embeddings are enabled
  if (isEmbeddingEnabled() && results.length < limit) {
    try {
      const vectorResults = await vectorSearch(query, userId, limit - results.length, {
        type: args.type,
        project: args.project,
        stage: args.stage,
      });
      const existingIds = new Set(results.map((r: any) => r.id));
      for (const vr of vectorResults) {
        if (!existingIds.has(vr.id)) {
          results.push(vr);
        }
      }
    } catch {}
  }

  await prisma.searchLog.create({
    data: { userId, query, resultsCount: results.length },
  });

  if (results.length === 0) {
    return { content: [{ type: "text" as const, text: `No results found for "${query}"` }] };
  }

  const text = results
    .map(
      (r: any, i: number) =>
        `${i + 1}. **${r.title}** (${r.type}) [${r.stage || "raw"}]\n   ${r.content.substring(0, 200)}${r.content.length > 200 ? "..." : ""}\n   Concepts: ${r.concepts.join(", ") || "none"} | Project: ${r.project || "none"}`
    )
    .join("\n\n");

  return { content: [{ type: "text" as const, text: `Found ${results.length} results for "${query}":\n\n${text}` }] };
}
