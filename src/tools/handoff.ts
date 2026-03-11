import { prisma } from "../db/index.js";

export const handoffTool = {
  name: "kuraith_handoff",
  description:
    "Create a handoff for the next session. Use this at the end of a work session to pass context, progress, and next steps to the next AI agent.",
  inputSchema: {
    type: "object" as const,
    properties: {
      context: {
        type: "string",
        description: "What was being worked on and current state",
      },
      nextSteps: {
        type: "array",
        items: { type: "string" },
        description: "List of next steps to continue",
      },
      warnings: {
        type: "array",
        items: { type: "string" },
        description: "Warnings or things to watch out for",
      },
      project: { type: "string", description: "Project name" },
    },
    required: ["context", "nextSteps"],
  },
};

export async function handleHandoff(args: {
  context: string;
  nextSteps: string[];
  warnings?: string[];
  project?: string;
  agent?: string;
}, userId: string) {
  const agentName = args.agent || "unknown";

  // Find or create current session
  let session = await prisma.session.findFirst({
    where: { userId, endedAt: null },
    orderBy: { startedAt: "desc" },
  });

  if (!session) {
    session = await prisma.session.create({
      data: { userId, agent: agentName, project: args.project },
    });
  }

  const handoff = await prisma.handoff.create({
    data: {
      userId,
      fromSessionId: session.id,
      context: args.context,
      nextSteps: args.nextSteps,
      warnings: args.warnings || [],
    },
  });

  // End the session
  await prisma.session.update({
    where: { id: session.id },
    data: {
      endedAt: new Date(),
      summary: args.context,
    },
  });

  await prisma.activityLog.create({
    data: { userId, action: "handoff", details: `Handoff created: ${args.nextSteps.length} next steps` },
  });

  return {
    content: [
      {
        type: "text" as const,
        text: `Handoff created (ID: ${handoff.id})${agentName !== "unknown" ? ` by ${agentName}` : ""}\n\nContext: ${args.context}\n\nNext steps:\n${args.nextSteps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\n\nWarnings:\n${(args.warnings || []).map((w) => `  ⚠ ${w}`).join("\n") || "  None"}`,
      },
    ],
  };
}
