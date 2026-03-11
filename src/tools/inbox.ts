import { prisma } from "../db/index.js";

export const inboxTool = {
  name: "kuraith_inbox",
  description:
    "Check for pending handoffs and messages from previous sessions. Use this at the start of a new session to get context.",
  inputSchema: {
    type: "object" as const,
    properties: {
      limit: { type: "number", description: "Max items to retrieve (default 5)" },
    },
    required: [],
  },
};

export async function handleInbox(args: { limit?: number }, userId: string) {
  const limit = args.limit || 5;

  const handoffs = await prisma.handoff.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { fromSession: true },
  });

  if (handoffs.length === 0) {
    return {
      content: [{ type: "text" as const, text: "Inbox is empty. No pending handoffs." }],
    };
  }

  const latest = handoffs[0];
  const timeAgo = getTimeAgo(latest.createdAt);
  const fromAgent = latest.fromSession?.agent || "unknown";

  const text = `**Latest Handoff** (${timeAgo}) — from: ${fromAgent}\n\nContext: ${latest.context}\n\nNext steps:\n${latest.nextSteps.map((s: string, i: number) => `  ${i + 1}. ${s}`).join("\n")}\n\nWarnings:\n${(latest.warnings as string[]).map((w: string) => `  ⚠ ${w}`).join("\n") || "  None"}\n\n---\n${handoffs.length > 1 ? `+${handoffs.length - 1} older handoffs available` : ""}`;

  await prisma.activityLog.create({
    data: { userId, action: "inbox.check", details: `Checked inbox: ${handoffs.length} handoffs` },
  });

  return { content: [{ type: "text" as const, text }] };
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
