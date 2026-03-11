import { FastifyInstance } from "fastify";
import { prisma } from "../db/index.js";

export async function documentRoutes(app: FastifyInstance) {
  // List documents
  app.get<{
    Querystring: { page?: string; limit?: string; type?: string; project?: string; stage?: string };
  }>("/", async (request) => {
    const userId = (request as any).userId;
    const page = parseInt(request.query.page || "1");
    const limit = Math.min(parseInt(request.query.limit || "20"), 100);
    const skip = (page - 1) * limit;

    const where: any = { userId, supersededBy: null };
    if (request.query.type) where.type = request.query.type;
    if (request.query.project) where.project = request.query.project;
    if (request.query.stage) where.stage = request.query.stage;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return { documents, total, page, limit };
  });

  // Get document by id
  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const doc = await prisma.document.findUnique({
      where: { id: request.params.id },
    });
    if (!doc) return reply.status(404).send({ error: "Not found" });
    return doc;
  });

  // Create document
  app.post<{
    Body: {
      title: string;
      content: string;
      type?: string;
      concepts?: string[];
      project?: string;
    };
  }>("/", async (request) => {
    const userId = (request as any).userId;
    const { title, content, type, concepts, project } = request.body;

    const doc = await prisma.document.create({
      data: { userId, title, content, type: type || "note", concepts: concepts || [], project },
    });

    // Log activity
    await prisma.activityLog.create({
      data: { userId, action: "document.create", details: `Created: ${title}` },
    });

    return doc;
  });

  // Update document
  app.put<{
    Params: { id: string };
    Body: { title?: string; content?: string; concepts?: string[]; project?: string };
  }>("/:id", async (request, reply) => {
    const doc = await prisma.document.findUnique({ where: { id: request.params.id } });
    if (!doc) return reply.status(404).send({ error: "Not found" });

    const updated = await prisma.document.update({
      where: { id: request.params.id },
      data: request.body,
    });

    return updated;
  });

  // Supersede (soft delete)
  app.delete<{
    Params: { id: string };
    Body: { reason?: string };
  }>("/:id", async (request, reply) => {
    const doc = await prisma.document.findUnique({ where: { id: request.params.id } });
    if (!doc) return reply.status(404).send({ error: "Not found" });

    const updated = await prisma.document.update({
      where: { id: request.params.id },
      data: { supersededBy: request.body?.reason || "manually superseded" },
    });

    await prisma.activityLog.create({
      data: {
        userId: (request as any).userId,
        action: "document.supersede",
        details: `Superseded: ${doc.title}`,
      },
    });

    return { message: "Document superseded (not deleted)", document: updated };
  });
}
