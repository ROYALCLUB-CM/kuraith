import { FastifyInstance } from "fastify";
import { prisma } from "../db/index.js";
import { AGENTS } from "../agents.js";

export async function missionControlRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const userId = (request as any).userId;

    const [
      sessionsByAgent,
      lastActivityByAgent,
      allTasks,
      workflows,
      recentHandoffs,
    ] = await Promise.all([
      // Sessions count per agent
      prisma.session.groupBy({
        by: ["agent"],
        where: { userId },
        _count: { id: true },
      }),
      // Last activity per agent
      prisma.session.groupBy({
        by: ["agent"],
        where: { userId },
        _max: { startedAt: true },
      }),
      // All workflow tasks for this user
      prisma.workflowTask.findMany({
        where: { workflow: { userId } },
        select: { agent: true, status: true },
      }),
      // Active + recent workflows
      prisma.workflow.findMany({
        where: { userId },
        include: { tasks: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Recent handoffs with session agent info
      prisma.handoff.findMany({
        where: { userId },
        include: {
          fromSession: { select: { agent: true, project: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // Build session counts map
    const sessionMap: Record<string, number> = {};
    for (const s of sessionsByAgent) {
      sessionMap[s.agent] = s._count.id;
    }

    // Build last activity map
    const lastActivityMap: Record<string, string> = {};
    for (const la of lastActivityByAgent) {
      if (la._max.startedAt) {
        lastActivityMap[la.agent] = la._max.startedAt.toISOString();
      }
    }

    // Build task counts per agent
    const taskMap: Record<string, { total: number; completed: number; inProgress: number }> = {};
    for (const t of allTasks) {
      if (!taskMap[t.agent]) taskMap[t.agent] = { total: 0, completed: 0, inProgress: 0 };
      taskMap[t.agent].total++;
      if (t.status === "completed") taskMap[t.agent].completed++;
      if (t.status === "in_progress") taskMap[t.agent].inProgress++;
    }

    // Build fleet data
    const fleet = AGENTS.map((agent) => ({
      name: agent.name,
      displayName: agent.displayName,
      sessions: sessionMap[agent.name] || 0,
      tasks: taskMap[agent.name]?.total || 0,
      tasksCompleted: taskMap[agent.name]?.completed || 0,
      tasksInProgress: taskMap[agent.name]?.inProgress || 0,
      lastActivity: lastActivityMap[agent.name] || null,
    }));

    // Communication log
    const communications = recentHandoffs.map((h: any) => ({
      id: h.id,
      agent: h.fromSession?.agent || "unknown",
      project: h.fromSession?.project || null,
      context: h.context.substring(0, 200),
      nextSteps: h.nextSteps || [],
      warnings: h.warnings || [],
      createdAt: h.createdAt,
      read: !!h.readAt,
    }));

    // Summary stats
    const totalSessions = Object.values(sessionMap).reduce((a, b) => a + b, 0);
    const activeAgents = fleet.filter((f) => f.sessions > 0).length;
    const activeWorkflows = workflows.filter(
      (w) => w.status === "pending" || w.status === "in_progress"
    ).length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === "completed").length;

    return {
      fleet,
      workflows,
      communications,
      stats: {
        totalAgents: AGENTS.length,
        activeAgents,
        totalSessions,
        activeWorkflows,
        totalWorkflows: workflows.length,
        totalTasks,
        completedTasks,
      },
    };
  });
}
