import { prisma } from "../db/index.js";

export const supersedeTool = {
  name: "kuraith_supersede",
  description:
    "Replace outdated knowledge with updated version. The old document is marked as superseded (not deleted — nothing is forgotten).",
  inputSchema: {
    type: "object" as const,
    properties: {
      oldDocumentId: {
        type: "string",
        description: "ID of the document to supersede",
      },
      title: { type: "string", description: "Title for the new version" },
      content: { type: "string", description: "Updated content" },
      concepts: {
        type: "array",
        items: { type: "string" },
        description: "Updated concepts/tags",
      },
    },
    required: ["oldDocumentId", "title", "content"],
  },
};

export async function handleSupersede(args: {
  oldDocumentId: string;
  title: string;
  content: string;
  concepts?: string[];
}, userId: string) {
  const oldDoc = await prisma.document.findUnique({
    where: { id: args.oldDocumentId },
  });

  if (!oldDoc) {
    return { content: [{ type: "text" as const, text: "Document not found." }] };
  }

  if (oldDoc.userId !== userId) {
    return { content: [{ type: "text" as const, text: "Not authorized." }] };
  }

  // Create new version
  const newDoc = await prisma.document.create({
    data: {
      userId,
      title: args.title,
      content: args.content,
      type: oldDoc.type,
      concepts: args.concepts || oldDoc.concepts,
      project: oldDoc.project,
    },
  });

  // Mark old as superseded
  await prisma.document.update({
    where: { id: oldDoc.id },
    data: { supersededBy: newDoc.id },
  });

  // Create trace link
  await prisma.traceLink.create({
    data: { sourceId: oldDoc.id, targetId: newDoc.id },
  });

  await prisma.activityLog.create({
    data: {
      userId,
      action: "supersede",
      details: `Superseded "${oldDoc.title}" → "${args.title}"`,
    },
  });

  return {
    content: [
      {
        type: "text" as const,
        text: `Superseded: "${oldDoc.title}" → "${args.title}"\nOld ID: ${oldDoc.id} (archived)\nNew ID: ${newDoc.id} (active)`,
      },
    ],
  };
}
