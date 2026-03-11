import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../db/index.js";

// Routes that don't need auth
const PUBLIC_ROUTES = [
  "/health",
  "/api/auth/register",
  "/api/auth/login",
];

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const url = request.url.split("?")[0];

  if (PUBLIC_ROUTES.includes(url)) return;
  if (!url.startsWith("/api")) return;

  // Check API key first
  const apiKey = request.headers["x-api-key"] as string | undefined;
  if (apiKey) {
    const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
    if (!key) {
      return reply.status(401).send({ error: "Invalid API key" });
    }
    // Update last used
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsed: new Date() },
    });
    (request as any).userId = key.userId;
    return;
  }

  // Check JWT token
  try {
    const decoded = await request.jwtVerify<{ id: string }>();
    (request as any).userId = decoded.id;
  } catch {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}
