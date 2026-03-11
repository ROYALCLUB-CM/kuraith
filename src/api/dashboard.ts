import { FastifyInstance } from "fastify";
import { prisma } from "../db/index.js";

export async function dashboardRoutes(app: FastifyInstance) {
  // Dashboard overview stats
  app.get("/stats", async (request) => {
    const userId = (request as any).userId;

    const [
      totalDocuments,
      totalSessions,
      totalLearnings,
      totalSearches,
      recentActivity,
    ] = await Promise.all([
      prisma.document.count({ where: { userId, supersededBy: null } }),
      prisma.session.count({ where: { userId } }),
      prisma.learning.count({ where: { userId } }),
      prisma.searchLog.count({ where: { userId } }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Pipeline stats
    const pipeline = await prisma.document.groupBy({
      by: ["stage"],
      where: { userId, supersededBy: null },
      _count: { id: true },
    });

    const pipelineStats: Record<string, number> = { raw: 0, refined: 0, gem: 0 };
    for (const p of pipeline) {
      pipelineStats[(p as any).stage || "raw"] = p._count.id;
    }

    return {
      documents: totalDocuments,
      sessions: totalSessions,
      learnings: totalLearnings,
      searches: totalSearches,
      pipeline: pipelineStats,
      recentActivity,
    };
  });

  // Document types breakdown
  app.get("/documents/types", async (request) => {
    const userId = (request as any).userId;

    const types = await prisma.document.groupBy({
      by: ["type"],
      where: { userId, supersededBy: null },
      _count: { id: true },
    });

    return { types: types.map((t) => ({ type: t.type, count: t._count.id })) };
  });

  // Recent learnings
  app.get("/learnings", async (request) => {
    const userId = (request as any).userId;

    const learnings = await prisma.learning.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return { learnings };
  });

  // Activity timeline
  app.get<{
    Querystring: { days?: string };
  }>("/activity", async (request) => {
    const userId = (request as any).userId;
    const days = parseInt(request.query.days || "7");
    const since = new Date();
    since.setDate(since.getDate() - days);

    const activity = await prisma.activityLog.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    });

    return { activity, days };
  });

  // Search history
  app.get<{
    Querystring: { limit?: string };
  }>("/searches", async (request) => {
    const userId = (request as any).userId;
    const limit = Math.min(parseInt(request.query.limit || "20"), 100);

    const searches = await prisma.searchLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { searches };
  });
}
