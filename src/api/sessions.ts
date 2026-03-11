import { FastifyInstance } from "fastify";
import { prisma } from "../db/index.js";

export async function sessionRoutes(app: FastifyInstance) {
  // List sessions
  app.get<{
    Querystring: { page?: string; limit?: string };
  }>("/", async (request) => {
    const userId = (request as any).userId;
    const page = parseInt(request.query.page || "1");
    const limit = Math.min(parseInt(request.query.limit || "20"), 100);
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.session.count({ where: { userId } }),
    ]);

    return { sessions, total, page, limit };
  });

  // Get session by id
  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const session = await prisma.session.findUnique({
      where: { id: request.params.id },
    });
    if (!session) return reply.status(404).send({ error: "Not found" });
    return session;
  });

  // Create session
  app.post<{
    Body: {
      agent: string;
      project?: string;
      summary?: string;
    };
  }>("/", async (request) => {
    const userId = (request as any).userId;
    const { agent, project, summary } = request.body;

    const session = await prisma.session.create({
      data: { userId, agent, project, summary },
    });

    await prisma.activityLog.create({
      data: { userId, action: "session.start", details: `Session started: ${agent}` },
    });

    return session;
  });

  // End session (update with summary)
  app.put<{
    Params: { id: string };
    Body: { summary?: string; discoveries?: string[] };
  }>("/:id", async (request, reply) => {
    const session = await prisma.session.findUnique({ where: { id: request.params.id } });
    if (!session) return reply.status(404).send({ error: "Not found" });

    const updated = await prisma.session.update({
      where: { id: request.params.id },
      data: {
        summary: request.body.summary,
        discoveries: request.body.discoveries || [],
        endedAt: new Date(),
      },
    });

    return updated;
  });

  // Create handoff between sessions
  app.post<{
    Body: {
      fromSessionId: string;
      context: string;
      nextSteps: string[];
      warnings?: string[];
    };
  }>("/handoff", async (request) => {
    const userId = (request as any).userId;
    const { fromSessionId, context, nextSteps, warnings } = request.body;

    const handoff = await prisma.handoff.create({
      data: {
        userId,
        fromSessionId,
        context,
        nextSteps,
        warnings: warnings || [],
      },
    });

    await prisma.activityLog.create({
      data: { userId, action: "session.handoff", details: `Handoff created from session ${fromSessionId}` },
    });

    return handoff;
  });

  // Get latest handoff (for session start / recap)
  app.get("/handoff/latest", async (request) => {
    const userId = (request as any).userId;

    const handoff = await prisma.handoff.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { fromSession: true },
    });

    return handoff || { message: "No handoff found" };
  });
}
