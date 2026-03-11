import { FastifyInstance } from "fastify";
import { prisma } from "../db/index.js";
import { createHash, randomBytes } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function generateApiKey(): string {
  return "krt_" + randomBytes(32).toString("hex");
}

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post<{
    Body: { email: string; name: string; password: string };
  }>("/register", async (request, reply) => {
    const { email, name, password } = request.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(400).send({ error: "Email already registered" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashPassword(password),
      },
    });

    const token = app.jwt.sign({ id: user.id }, { expiresIn: "7d" });

    return { user: { id: user.id, email: user.email, name: user.name }, token };
  });

  // Login
  app.post<{
    Body: { email: string; password: string };
  }>("/login", async (request, reply) => {
    const { email, password } = request.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordHash !== hashPassword(password)) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = app.jwt.sign({ id: user.id }, { expiresIn: "7d" });

    return { user: { id: user.id, email: user.email, name: user.name }, token };
  });

  // Create API key
  app.post<{
    Body: { name: string };
  }>("/api-key", async (request, reply) => {
    const userId = (request as any).userId;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    const key = generateApiKey();
    const apiKey = await prisma.apiKey.create({
      data: { userId, key, name: request.body.name },
    });

    return { id: apiKey.id, key, name: apiKey.name };
  });

  // List API keys
  app.get("/api-keys", async (request, reply) => {
    const userId = (request as any).userId;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    const keys = await prisma.apiKey.findMany({
      where: { userId },
      select: { id: true, name: true, createdAt: true, lastUsed: true },
    });

    return { keys };
  });
}
