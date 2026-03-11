import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/db/index.js", () => {
  return {
    prisma: {
      document: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      activityLog: { create: vi.fn() },
    },
  };
});

import { handleRefine } from "../../src/tools/refine.js";
import { prisma } from "../../src/db/index.js";

describe("handleRefine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.document.update as any).mockResolvedValue({});
    (prisma.activityLog.create as any).mockResolvedValue({});
  });

  it("returns error for non-existent document", async () => {
    (prisma.document.findFirst as any).mockResolvedValue(null);

    const result = await handleRefine(
      { documentId: "nonexistent", targetStage: "refined" },
      "user-123"
    );

    expect(result.content[0].text).toContain("Document not found");
    expect(prisma.document.update).not.toHaveBeenCalled();
  });

  it("promotes raw → refined", async () => {
    (prisma.document.findFirst as any).mockResolvedValue({
      id: "doc1",
      title: "Test Doc",
      stage: "raw",
    });

    const result = await handleRefine(
      { documentId: "doc1", targetStage: "refined" },
      "user-123"
    );

    expect(prisma.document.update).toHaveBeenCalledWith({
      where: { id: "doc1" },
      data: expect.objectContaining({ stage: "refined" }),
    });
    expect(result.content[0].text).toContain("raw → refined");
  });

  it("promotes refined → gem", async () => {
    (prisma.document.findFirst as any).mockResolvedValue({
      id: "doc1",
      title: "Test Doc",
      stage: "refined",
    });

    const result = await handleRefine(
      { documentId: "doc1", targetStage: "gem" },
      "user-123"
    );

    expect(result.content[0].text).toContain("refined → gem");
  });

  it("rejects demotion (gem → raw)", async () => {
    (prisma.document.findFirst as any).mockResolvedValue({
      id: "doc1",
      title: "Test Doc",
      stage: "gem",
    });

    const result = await handleRefine(
      { documentId: "doc1", targetStage: "raw" },
      "user-123"
    );

    expect(result.content[0].text).toContain("Cannot move");
    expect(prisma.document.update).not.toHaveBeenCalled();
  });

  it("rejects same stage (refined → refined)", async () => {
    (prisma.document.findFirst as any).mockResolvedValue({
      id: "doc1",
      title: "Test Doc",
      stage: "refined",
    });

    const result = await handleRefine(
      { documentId: "doc1", targetStage: "refined" },
      "user-123"
    );

    expect(result.content[0].text).toContain("Cannot move");
    expect(prisma.document.update).not.toHaveBeenCalled();
  });

  it("rejects invalid stage", async () => {
    (prisma.document.findFirst as any).mockResolvedValue({
      id: "doc1",
      title: "Test Doc",
      stage: "raw",
    });

    const result = await handleRefine(
      { documentId: "doc1", targetStage: "invalid" },
      "user-123"
    );

    expect(result.content[0].text).toContain("Invalid stage");
    expect(prisma.document.update).not.toHaveBeenCalled();
  });

  it("includes notes in update when provided", async () => {
    (prisma.document.findFirst as any).mockResolvedValue({
      id: "doc1",
      title: "Test Doc",
      stage: "raw",
    });

    await handleRefine(
      { documentId: "doc1", targetStage: "refined", notes: "Well validated" },
      "user-123"
    );

    expect(prisma.document.update).toHaveBeenCalledWith({
      where: { id: "doc1" },
      data: expect.objectContaining({
        refinedNotes: "Well validated",
      }),
    });
  });

  it("logs activity on successful refine", async () => {
    (prisma.document.findFirst as any).mockResolvedValue({
      id: "doc1",
      title: "Test Doc",
      stage: "raw",
    });

    await handleRefine(
      { documentId: "doc1", targetStage: "refined" },
      "user-123"
    );

    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "refine",
        userId: "user-123",
      }),
    });
  });
});
