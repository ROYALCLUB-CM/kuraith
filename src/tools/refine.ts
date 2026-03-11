import { prisma } from "../db/index.js";

export async function handleRefine(args: {
  documentId: string;
  targetStage: string;
  notes?: string;
}, userId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: args.documentId, userId },
  });

  if (!doc) {
    return { content: [{ type: "text" as const, text: `Document not found: ${args.documentId}` }] };
  }

  const currentStage = (doc as any).stage || "raw";
  const target = args.targetStage;

  // Validate promotion path: raw → refined → gem
  const stageOrder = ["raw", "refined", "gem"];
  const currentIdx = stageOrder.indexOf(currentStage);
  const targetIdx = stageOrder.indexOf(target);

  if (targetIdx < 0) {
    return { content: [{ type: "text" as const, text: `Invalid stage: ${target}. Must be: raw, refined, or gem` }] };
  }

  if (targetIdx <= currentIdx) {
    return { content: [{ type: "text" as const, text: `Cannot move from "${currentStage}" to "${target}". Only promotion is allowed (raw → refined → gem).` }] };
  }

  await prisma.document.update({
    where: { id: doc.id },
    data: {
      stage: target,
      refinedAt: new Date(),
      refinedNotes: args.notes || null,
    } as any,
  });

  await prisma.activityLog.create({
    data: { userId, action: "refine", details: `${doc.title}: ${currentStage} → ${target}` },
  });

  return {
    content: [
      {
        type: "text" as const,
        text: `Refined: "${doc.title}"\n  ${currentStage} → ${target}\n  ${args.notes ? `Notes: ${args.notes}` : ""}`,
      },
    ],
  };
}
