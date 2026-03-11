import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/db/index.js", () => {
  return {
    prisma: {
      document: { create: vi.fn() },
      learning: { create: vi.fn() },
      activityLog: { create: vi.fn() },
    },
  };
});

vi.mock("../../src/services/embeddings.js", () => ({
  isEmbeddingEnabled: vi.fn().mockReturnValue(false),
  embedDocument: vi.fn().mockResolvedValue(false),
}));

import { handleLearn } from "../../src/tools/learn.js";
import { prisma } from "../../src/db/index.js";

describe("handleLearn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.document.create as any).mockResolvedValue({
      id: "test-doc-id",
      title: "Test",
      content: "content",
    });
    (prisma.learning.create as any).mockResolvedValue({});
    (prisma.activityLog.create as any).mockResolvedValue({});
  });

  it("creates document with default type and stage", async () => {
    const result = await handleLearn(
      { title: "Test Learning", content: "Test content" },
      "user-123"
    );

    expect(prisma.document.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-123",
        title: "Test Learning",
        content: "Test content",
        type: "knowledge",
        stage: "raw",
      }),
    });
    expect(result.content[0].text).toContain("Remembered");
    expect(result.content[0].text).toContain("Test Learning");
  });

  it("uses provided type and stage", async () => {
    await handleLearn(
      { title: "Bug", content: "Bug found", type: "bug", stage: "refined" },
      "user-123"
    );

    expect(prisma.document.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "bug",
        stage: "refined",
      }),
    });
  });

  it("stores concepts", async () => {
    await handleLearn(
      {
        title: "Pattern",
        content: "A pattern",
        concepts: ["typescript", "prisma"],
      },
      "user-123"
    );

    expect(prisma.learning.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "Pattern",
        concepts: ["typescript", "prisma"],
      }),
    });
  });

  it("logs activity", async () => {
    await handleLearn({ title: "Test", content: "content" }, "user-123");

    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "learn",
        userId: "user-123",
      }),
    });
  });

  it("returns document ID in response", async () => {
    const result = await handleLearn(
      { title: "Test", content: "content" },
      "user-123"
    );

    expect(result.content[0].text).toContain("test-doc-id");
  });
});
