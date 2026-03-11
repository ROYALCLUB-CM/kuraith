import { prisma } from "../db/index.js";

export const statsTool = {
  name: "kuraith_stats",
  description:
    "Get KURAITH usage statistics. Shows document counts, session counts, search activity, and storage usage.",
  inputSchema: {
    type: "object" as const,
    properties: {
      project: { type: "string", description: "Filter by project" },
    },
    required: [],
  },
};

export async function handleStats(args: { project?: string }, userId: string) {
  const projectFilter = args.project ? { project: args.project } : {};

  const [
    totalDocs,
    totalSessions,
    totalLearnings,
    totalSearches,
    totalHandoffs,
    docsByType,
    docsByStage,
    recentDocs,
    totalWorkflows,
    activeWorkflows,
  ] = await Promise.all([
    prisma.document.count({ where: { userId, supersededBy: null, ...projectFilter } }),
    prisma.session.count({ where: { userId } }),
    prisma.learning.count({ where: { userId } }),
    prisma.searchLog.count({ where: { userId } }),
    prisma.handoff.count({ where: { userId } }),
    prisma.document.groupBy({
      by: ["type"],
      where: { userId, supersededBy: null, ...projectFilter },
      _count: { id: true },
    }),
    prisma.document.groupBy({
      by: ["stage"],
      where: { userId, supersededBy: null, ...projectFilter },
      _count: { id: true },
    }),
    prisma.document.findMany({
      where: { userId, supersededBy: null, ...projectFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, type: true, stage: true, createdAt: true },
    }),
    (prisma as any).workflow.count({ where: { userId } }).catch(() => 0),
    (prisma as any).workflow.count({ where: { userId, status: "in_progress" } }).catch(() => 0),
  ]);

  const typeBreakdown = docsByType
    .map((t: any) => `  ${t.type}: ${t._count.id}`)
    .join("\n");

  const stageBreakdown = docsByStage
    .map((s: any) => `  ${s.stage}: ${s._count.id}`)
    .join("\n");

  const recent = recentDocs
    .map((d: any) => `  - ${d.title} (${d.type}) [${d.stage || "raw"}]`)
    .join("\n");

  const text = `**KURAITH Stats**${args.project ? ` — Project: ${args.project}` : ""}\n\n**Totals:**\n  Documents: ${totalDocs}\n  Sessions: ${totalSessions}\n  Learnings: ${totalLearnings}\n  Searches: ${totalSearches}\n  Handoffs: ${totalHandoffs}\n  Workflows: ${totalWorkflows}${activeWorkflows > 0 ? ` (${activeWorkflows} active)` : ""}\n\n**Documents by Type:**\n${typeBreakdown || "  None yet"}\n\n**Knowledge Pipeline:**\n${stageBreakdown || "  None yet"}\n\n**Recent Documents:**\n${recent || "  None yet"}`;

  return { content: [{ type: "text" as const, text }] };
}
