import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/db/index.js", () => {
  return {
    prisma: {
      document: { findMany: vi.fn() },
      searchLog: { create: vi.fn() },
    },
  };
});

vi.mock("../../src/services/embeddings.js", () => ({
  isEmbeddingEnabled: vi.fn().mockReturnValue(false),
  vectorSearch: vi.fn().mockResolvedValue([]),
}));

import { handleSearch } from "../../src/tools/search.js";
import { prisma } from "../../src/db/index.js";

describe("handleSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.searchLog.create as any).mockResolvedValue({});
  });

  it('returns "no results" when nothing found', async () => {
    (prisma.document.findMany as any).mockResolvedValue([]);

    const result = await handleSearch({ query: "nonexistent" }, "user-123");

    expect(result.content[0].text).toContain("No results found");
  });

  it("returns formatted results", async () => {
    (prisma.document.findMany as any).mockResolvedValue([
      {
        id: "doc1",
        title: "Test Doc",
        content: "Test content here",
        type: "knowledge",
        concepts: ["testing"],
        project: "kuraith",
        stage: "raw",
        createdAt: new Date(),
      },
    ]);

    const result = await handleSearch({ query: "test" }, "user-123");

    expect(result.content[0].text).toContain("Found 1 results");
    expect(result.content[0].text).toContain("Test Doc");
    expect(result.content[0].text).toContain("[raw]");
  });

  it("limits results to max 50", async () => {
    (prisma.document.findMany as any).mockResolvedValue([]);

    await handleSearch({ query: "test", limit: 100 }, "user-123");

    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it("filters by type", async () => {
    (prisma.document.findMany as any).mockResolvedValue([]);

    await handleSearch({ query: "test", type: "bug" }, "user-123");

    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: "bug" }),
      })
    );
  });

  it("filters by stage", async () => {
    (prisma.document.findMany as any).mockResolvedValue([]);

    await handleSearch({ query: "test", stage: "gem" }, "user-123");

    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ stage: "gem" }),
      })
    );
  });

  it("filters by project", async () => {
    (prisma.document.findMany as any).mockResolvedValue([]);

    await handleSearch({ query: "test", project: "kuraith" }, "user-123");

    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ project: "kuraith" }),
      })
    );
  });

  it("logs search", async () => {
    (prisma.document.findMany as any).mockResolvedValue([]);

    await handleSearch({ query: "test" }, "user-123");

    expect(prisma.searchLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-123",
        query: "test",
        resultsCount: 0,
      }),
    });
  });

  it("truncates long content in results", async () => {
    const longContent = "x".repeat(500);
    (prisma.document.findMany as any).mockResolvedValue([
      {
        id: "doc1",
        title: "Long Doc",
        content: longContent,
        type: "knowledge",
        concepts: [],
        project: null,
        stage: "raw",
        createdAt: new Date(),
      },
    ]);

    const result = await handleSearch({ query: "x" }, "user-123");

    expect(result.content[0].text).toContain("...");
  });
});
