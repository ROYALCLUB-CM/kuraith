import { prisma } from "../db/index.js";

export const traceTool = {
  name: "kuraith_trace",
  description:
    "Trace connections between knowledge. Finds related documents, linked concepts, and knowledge paths.",
  inputSchema: {
    type: "object" as const,
    properties: {
      documentId: { type: "string", description: "Start tracing from this document ID" },
      concept: { type: "string", description: "Trace all documents with this concept" },
      depth: { type: "number", description: "How many levels deep to trace (default 2)" },
    },
    required: [],
  },
};

export async function handleTrace(args: {
  documentId?: string;
  concept?: string;
  depth?: number;
}, userId: string) {
  if (!args.documentId && !args.concept) {
    return {
      content: [{ type: "text" as const, text: "Please provide either documentId or concept to trace." }],
    };
  }

  const results: any[] = [];

  if (args.documentId) {
    // Trace from a specific document
    const doc = await prisma.document.findUnique({
      where: { id: args.documentId },
      select: { id: true, title: true, concepts: true, project: true },
    });

    if (!doc) {
      return { content: [{ type: "text" as const, text: "Document not found." }] };
    }

    // Find related docs by shared concepts
    if (doc.concepts.length > 0) {
      const related = await prisma.document.findMany({
        where: {
          userId,
          id: { not: doc.id },
          supersededBy: null,
          concepts: { hasSome: doc.concepts },
        },
        take: 20,
        select: {
          id: true,
          title: true,
          type: true,
          concepts: true,
          project: true,
        },
      });
      results.push(...related);
    }

    // Check trace links
    const links = await prisma.traceLink.findMany({
      where: {
        OR: [{ sourceId: doc.id }, { targetId: doc.id }],
      },
      include: { source: true, target: true },
    });

    const text = `**Trace from:** ${doc.title}\nConcepts: ${doc.concepts.join(", ")}\n\n**Related Documents (${results.length}):**\n${results.map((r) => {
      const shared = r.concepts.filter((c: string) => doc.concepts.includes(c));
      return `  - ${r.title} (${r.type}) — shared: ${shared.join(", ")}`;
    }).join("\n") || "  None found"}\n\n**Direct Links (${links.length}):**\n${links.map((l) => `  - ${l.sourceId === doc.id ? l.target.title : l.source.title}`).join("\n") || "  None"}`;

    await prisma.activityLog.create({
      data: { userId, action: "trace", details: `Traced: ${doc.title}` },
    });

    return { content: [{ type: "text" as const, text }] };
  }

  // Trace by concept
  const docs = await prisma.document.findMany({
    where: {
      userId,
      supersededBy: null,
      concepts: { hasSome: [args.concept!] },
    },
    take: 30,
    select: {
      id: true,
      title: true,
      type: true,
      concepts: true,
      project: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const text = `**Trace concept:** "${args.concept}"\n\n**Documents (${docs.length}):**\n${docs.map((d) => `  - ${d.title} (${d.type}) — ${d.concepts.join(", ")}`).join("\n") || "  None found"}`;

  await prisma.activityLog.create({
    data: { userId, action: "trace", details: `Traced concept: ${args.concept}` },
  });

  return { content: [{ type: "text" as const, text }] };
}
