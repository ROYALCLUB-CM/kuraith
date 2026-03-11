import { FastifyInstance } from "fastify";
import { prisma } from "../db/index.js";

export async function workflowRoutes(app: FastifyInstance) {
  // List workflows
  app.get<{
    Querystring: { status?: string; limit?: string };
  }>("/", async (request) => {
    const userId = (request as any).userId;
    const limit = Math.min(parseInt(request.query.limit || "20"), 100);

    const where: any = { userId };
    if (request.query.status) where.status = request.query.status;

    const workflows = await (prisma as any).workflow.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { tasks: { orderBy: { createdAt: "asc" } } },
    });

    return { workflows };
  });

  // Get workflow by ID
  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const userId = (request as any).userId;

    const workflow = await (prisma as any).workflow.findFirst({
      where: { id: request.params.id, userId },
      include: { tasks: { orderBy: { createdAt: "asc" } } },
    });

    if (!workflow) return reply.status(404).send({ error: "Not found" });
    return workflow;
  });

  // Create workflow
  app.post<{
    Body: {
      name: string;
      description?: string;
      tasks: Array<{ title: string; agent: string; branch?: string; description?: string }>;
    };
  }>("/", async (request) => {
    const userId = (request as any).userId;
    const { name, description, tasks } = request.body;

    const workflow = await (prisma as any).workflow.create({
      data: {
        userId,
        name,
        description: description || "",
        status: "pending",
      },
    });

    for (const task of tasks) {
      await (prisma as any).workflowTask.create({
        data: {
          workflowId: workflow.id,
          title: task.title,
          agent: task.agent,
          agentDisplay: task.agent,
          branch: task.branch || null,
          description: task.description || "",
          status: "pending",
        },
      });
    }

    const result = await (prisma as any).workflow.findFirst({
      where: { id: workflow.id },
      include: { tasks: true },
    });

    await prisma.activityLog.create({
      data: { userId, action: "workflow.create", details: `Created: ${name}` },
    });

    return result;
  });

  // Update workflow task
  app.put<{
    Params: { id: string; taskId: string };
    Body: { status?: string; notes?: string; agent?: string };
  }>("/:id/tasks/:taskId", async (request, reply) => {
    const userId = (request as any).userId;

    const workflow = await (prisma as any).workflow.findFirst({
      where: { id: request.params.id, userId },
    });
    if (!workflow) return reply.status(404).send({ error: "Workflow not found" });

    const task = await (prisma as any).workflowTask.findFirst({
      where: { id: request.params.taskId, workflowId: workflow.id },
    });
    if (!task) return reply.status(404).send({ error: "Task not found" });

    const updateData: any = {};
    if (request.body.status) updateData.status = request.body.status;
    if (request.body.notes) updateData.notes = request.body.notes;
    if (request.body.agent) {
      updateData.agent = request.body.agent;
      updateData.agentDisplay = request.body.agent;
    }
    if (request.body.status === "in_progress") updateData.claimedAt = new Date();
    if (request.body.status === "completed") updateData.completedAt = new Date();

    const updated = await (prisma as any).workflowTask.update({
      where: { id: task.id },
      data: updateData,
    });

    return updated;
  });

  // Delete workflow
  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const userId = (request as any).userId;

    const workflow = await (prisma as any).workflow.findFirst({
      where: { id: request.params.id, userId },
    });
    if (!workflow) return reply.status(404).send({ error: "Not found" });

    await (prisma as any).workflowTask.deleteMany({ where: { workflowId: workflow.id } });
    await (prisma as any).workflow.delete({ where: { id: workflow.id } });

    return { message: "Workflow deleted" };
  });
}
