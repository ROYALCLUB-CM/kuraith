import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

vi.mock("../../src/db/index.js", () => ({
  prisma: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    apiKey: { findUnique: vi.fn() },
  },
  connectDB: vi.fn(),
  disconnectDB: vi.fn(),
}));

import { createServer } from "../../src/server.js";
import type { FastifyInstance } from "fastify";

describe("Health API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns ok", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ok");
    expect(body.name).toBe("KURAITH");
    expect(body.version).toBe("1.0.0");
    expect(body.timestamp).toBeDefined();
  });
});
