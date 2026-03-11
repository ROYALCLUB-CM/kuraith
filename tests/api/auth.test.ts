import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import { createHash } from "node:crypto";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  apiKey: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
}));

vi.mock("../../src/db/index.js", () => ({
  prisma: mockPrisma,
  connectDB: vi.fn(),
  disconnectDB: vi.fn(),
}));

import { createServer } from "../../src/server.js";
import type { FastifyInstance } from "fastify";

describe("Auth API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("creates user and returns token", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test",
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "test@example.com",
          name: "Test",
          password: "test123",
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.user.email).toBe("test@example.com");
      expect(body.token).toBeDefined();
    });

    it("rejects duplicate email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

      const res = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "test@example.com",
          name: "Test",
          password: "test123",
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error).toContain("already registered");
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns token for valid credentials", async () => {
      const hash = createHash("sha256").update("test123").digest("hex");
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test",
        passwordHash: hash,
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "test@example.com", password: "test123" },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe("test@example.com");
    });

    it("rejects invalid password", async () => {
      const hash = createHash("sha256").update("correct").digest("hex");
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        passwordHash: hash,
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "test@example.com", password: "wrong" },
      });

      expect(res.statusCode).toBe(401);
    });

    it("rejects non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "no@exist.com", password: "test123" },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("protected routes", () => {
    it("rejects unauthenticated requests", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/documents",
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
