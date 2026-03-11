import { prisma } from "../db/index.js";
import { AGENTS, getAgent } from "../agents.js";
import { isTelegramEnabled, notifyWorkflowCreated, notifyTaskCompleted, notifyWorkflowCompleted, notifyWorkflowFailed } from "../services/telegram.js";

// --- kuraith_workflow ---

export async function handleWorkflow(args: {
  action: string;
  name?: string;
  description?: string;
  tasks?: Array<{ title: string; agent: string; branch?: string; description?: string }>;
  workflowId?: string;
  taskId?: string;
  status?: string;
  agent?: string;
  notes?: string;
}, userId: string) {
  switch (args.action) {
    case "create":
      return await createWorkflow(args, userId);
    case "list":
      return await listWorkflows(userId);
    case "get":
      return await getWorkflow(args, userId);
    case "claim":
      return await claimTask(args, userId);
    case "update":
      return await updateTask(args, userId);
    default:
      return { content: [{ type: "text" as const, text: `Unknown action: ${args.action}. Use: create, list, get, claim, update` }] };
  }
}

async function createWorkflow(args: any, userId: string) {
  if (!args.name || !args.tasks || args.tasks.length === 0) {
    return { content: [{ type: "text" as const, text: "Required: name, tasks (array with title + agent)" }] };
  }

  const workflow = await (prisma as any).workflow.create({
    data: {
      userId,
      name: args.name,
      description: args.description || "",
      status: "pending",
    },
  });

  const taskResults = [];
  for (const task of args.tasks) {
    const agentConfig = getAgent(task.agent);
    const t = await (prisma as any).workflowTask.create({
      data: {
        workflowId: workflow.id,
        title: task.title,
        agent: task.agent,
        agentDisplay: agentConfig?.displayName || task.agent,
        branch: task.branch || null,
        description: task.description || "",
        status: "pending",
      },
    });
    taskResults.push(t);
  }

  await prisma.activityLog.create({
    data: { userId, action: "workflow.create", details: `Created workflow: ${args.name} (${taskResults.length} tasks)` },
  });

  const taskList = taskResults.map((t: any, i: number) => `  ${i + 1}. [${t.status}] ${t.title} → ${t.agentDisplay}${t.branch ? ` (${t.branch})` : ""}`).join("\n");

  if (isTelegramEnabled()) {
    notifyWorkflowCreated(args.name, taskResults.length).catch(() => {});
  }

  return {
    content: [{
      type: "text" as const,
      text: `Workflow created: "${args.name}" (ID: ${workflow.id})\n\nTasks:\n${taskList}`,
    }],
  };
}

async function listWorkflows(userId: string) {
  const workflows = await (prisma as any).workflow.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { tasks: true },
  });

  if (workflows.length === 0) {
    return { content: [{ type: "text" as const, text: "No workflows found." }] };
  }

  const text = workflows.map((w: any) => {
    const done = w.tasks.filter((t: any) => t.status === "completed").length;
    return `- **${w.name}** [${w.status}] — ${done}/${w.tasks.length} tasks done (ID: ${w.id})`;
  }).join("\n");

  return { content: [{ type: "text" as const, text: `**Workflows:**\n\n${text}` }] };
}

async function getWorkflow(args: any, userId: string) {
  if (!args.workflowId) {
    return { content: [{ type: "text" as const, text: "Required: workflowId" }] };
  }

  const workflow = await (prisma as any).workflow.findFirst({
    where: { id: args.workflowId, userId },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });

  if (!workflow) {
    return { content: [{ type: "text" as const, text: `Workflow not found: ${args.workflowId}` }] };
  }

  const taskList = workflow.tasks.map((t: any, i: number) =>
    `  ${i + 1}. [${t.status}] ${t.title}\n     Agent: ${t.agentDisplay} | Branch: ${t.branch || "none"}\n     ${t.notes ? `Notes: ${t.notes}` : ""}`
  ).join("\n");

  return {
    content: [{
      type: "text" as const,
      text: `**Workflow: ${workflow.name}** [${workflow.status}]\n${workflow.description}\n\nTasks:\n${taskList}`,
    }],
  };
}

async function claimTask(args: any, userId: string) {
  if (!args.taskId || !args.agent) {
    return { content: [{ type: "text" as const, text: "Required: taskId, agent" }] };
  }

  const task = await (prisma as any).workflowTask.findFirst({
    where: { id: args.taskId },
    include: { workflow: true },
  });

  if (!task || task.workflow.userId !== userId) {
    return { content: [{ type: "text" as const, text: `Task not found: ${args.taskId}` }] };
  }

  if (task.status !== "pending") {
    return { content: [{ type: "text" as const, text: `Task already ${task.status}` }] };
  }

  const agentConfig = getAgent(args.agent);
  await (prisma as any).workflowTask.update({
    where: { id: task.id },
    data: {
      status: "in_progress",
      agent: args.agent,
      agentDisplay: agentConfig?.displayName || args.agent,
      claimedAt: new Date(),
    },
  });

  // Update workflow status
  await (prisma as any).workflow.update({
    where: { id: task.workflowId },
    data: { status: "in_progress" },
  });

  await prisma.activityLog.create({
    data: { userId, action: "workflow.claim", details: `${args.agent} claimed: ${task.title}` },
  });

  return {
    content: [{
      type: "text" as const,
      text: `Task claimed by ${agentConfig?.displayName || args.agent}: "${task.title}"\nBranch: ${task.branch || "none"}`,
    }],
  };
}

async function updateTask(args: any, userId: string) {
  if (!args.taskId || !args.status) {
    return { content: [{ type: "text" as const, text: "Required: taskId, status (pending/in_progress/completed/failed)" }] };
  }

  const task = await (prisma as any).workflowTask.findFirst({
    where: { id: args.taskId },
    include: { workflow: true },
  });

  if (!task || task.workflow.userId !== userId) {
    return { content: [{ type: "text" as const, text: `Task not found: ${args.taskId}` }] };
  }

  const updateData: any = {
    status: args.status,
    notes: args.notes || task.notes,
  };
  if (args.status === "completed") {
    updateData.completedAt = new Date();
  }

  await (prisma as any).workflowTask.update({
    where: { id: task.id },
    data: updateData,
  });

  // Check if all tasks completed → complete workflow
  const allTasks = await (prisma as any).workflowTask.findMany({
    where: { workflowId: task.workflowId },
  });
  const allDone = allTasks.every((t: any) => t.status === "completed");
  const anyFailed = allTasks.some((t: any) => t.status === "failed");

  if (allDone) {
    await (prisma as any).workflow.update({
      where: { id: task.workflowId },
      data: { status: "completed", completedAt: new Date() },
    });
    if (isTelegramEnabled()) {
      notifyWorkflowCompleted(task.workflow.name).catch(() => {});
    }
  } else if (anyFailed) {
    await (prisma as any).workflow.update({
      where: { id: task.workflowId },
      data: { status: "failed" },
    });
    if (isTelegramEnabled()) {
      notifyWorkflowFailed(task.workflow.name, task.title, task.agent || "unknown").catch(() => {});
    }
  }

  if (isTelegramEnabled() && args.status === "completed") {
    notifyTaskCompleted(task.workflow.name, task.title, task.agent || "unknown").catch(() => {});
  }

  await prisma.activityLog.create({
    data: { userId, action: "workflow.update", details: `Task "${task.title}" → ${args.status}` },
  });

  return {
    content: [{
      type: "text" as const,
      text: `Task updated: "${task.title}" → ${args.status}${allDone ? "\n\nAll tasks completed! Workflow marked as completed." : ""}`,
    }],
  };
}

// --- kuraith_coordinate ---

export async function handleCoordinate(args: {
  workflowId: string;
  message?: string;
  fromAgent?: string;
  toAgent?: string;
}, userId: string) {
  const workflow = await (prisma as any).workflow.findFirst({
    where: { id: args.workflowId, userId },
    include: { tasks: true },
  });

  if (!workflow) {
    return { content: [{ type: "text" as const, text: `Workflow not found: ${args.workflowId}` }] };
  }

  // If message provided, create a handoff between agents in the workflow
  if (args.message && args.fromAgent) {
    await prisma.handoff.create({
      data: {
        userId,
        context: `[Workflow: ${workflow.name}] ${args.message}`,
        nextSteps: args.toAgent ? [`${args.toAgent}: Review this message`] : [],
        warnings: [],
      },
    });

    await prisma.activityLog.create({
      data: { userId, action: "workflow.coordinate", details: `${args.fromAgent} → ${args.toAgent || "all"}: ${args.message.slice(0, 100)}` },
    });

    return {
      content: [{
        type: "text" as const,
        text: `Coordination message sent in workflow "${workflow.name}"\nFrom: ${args.fromAgent}\nTo: ${args.toAgent || "all agents"}\nMessage: ${args.message}`,
      }],
    };
  }

  // Otherwise show workflow status
  const statusLines = workflow.tasks.map((t: any, i: number) =>
    `  ${i + 1}. [${t.status}] ${t.title} — ${t.agentDisplay}${t.branch ? ` (${t.branch})` : ""}`
  );

  return {
    content: [{
      type: "text" as const,
      text: `**Workflow: ${workflow.name}** [${workflow.status}]\n\n${statusLines.join("\n")}`,
    }],
  };
}
