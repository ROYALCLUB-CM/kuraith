import { prisma } from "../db/index.js";
import { embedDocument, isEmbeddingEnabled } from "../services/embeddings.js";
import { isTelegramEnabled, notifyLearn } from "../services/telegram.js";
import { emitEvent } from "../events.js";

export const learnTool = {
  name: "kuraith_learn",
  description:
    "Store a new learning, pattern, decision, or piece of knowledge in KURAITH memory. Use this when you discover something worth remembering.",
  inputSchema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Short title for this knowledge" },
      content: { type: "string", description: "Detailed content to remember" },
      type: {
        type: "string",
        description: "Type of knowledge",
        enum: ["knowledge", "decision", "pattern", "bug"],
        default: "knowledge",
      },
      concepts: {
        type: "array",
        items: { type: "string" },
        description: "Related concepts/tags",
      },
      project: { type: "string", description: "Project name" },
    },
    required: ["title", "content"],
  },
};

export async function handleLearn(args: {
  title: string;
  content: string;
  type?: string;
  concepts?: string[];
  project?: string;
  stage?: string;
}, userId: string) {
  const stage = args.stage || "raw";
  const doc = await prisma.document.create({
    data: {
      userId,
      title: args.title,
      content: args.content,
      type: args.type || "knowledge",
      concepts: args.concepts || [],
      project: args.project,
      stage,
    } as any,
  });

  await prisma.learning.create({
    data: {
      userId,
      title: args.title,
      content: args.content,
      concepts: args.concepts || [],
      project: args.project,
    },
  });

  await prisma.activityLog.create({
    data: { userId, action: "learn", details: `Learned: ${args.title}` },
  });

  // Auto-embed if OpenAI API key is configured
  if (isEmbeddingEnabled()) {
    embedDocument(doc.id, `${args.title}\n\n${args.content}`).catch(() => {});
  }

  // Telegram notification
  if (isTelegramEnabled()) {
    notifyLearn(args.title, args.type || "knowledge", stage).catch(() => {});
  }

  // Real-time event
  emitEvent("learn", { id: doc.id, title: args.title, type: args.type || "knowledge", stage });

  return {
    content: [
      {
        type: "text" as const,
        text: `Remembered: "${args.title}" (${args.type || "knowledge"}) [${stage}]\nID: ${doc.id}\nConcepts: ${(args.concepts || []).join(", ") || "none"}`,
      },
    ],
  };
}
