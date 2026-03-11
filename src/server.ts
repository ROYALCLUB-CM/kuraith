import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { authRoutes } from "./api/auth.js";
import { documentRoutes } from "./api/documents.js";
import { searchRoutes } from "./api/search.js";
import { sessionRoutes } from "./api/sessions.js";
import { dashboardRoutes } from "./api/dashboard.js";
import { workflowRoutes } from "./api/workflows.js";
import { authMiddleware } from "./api/middleware.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function createServer() {
  const app = Fastify({ logger: false });

  // Plugins
  await app.register(cors, { origin: true });
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "kuraith-default-secret",
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Auth middleware for /api routes
  app.addHook("onRequest", authMiddleware);

  // Routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(documentRoutes, { prefix: "/api/documents" });
  await app.register(searchRoutes, { prefix: "/api/search" });
  await app.register(sessionRoutes, { prefix: "/api/sessions" });
  await app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  await app.register(workflowRoutes, { prefix: "/api/workflows" });

  // Health check
  app.get("/health", async () => ({
    status: "ok",
    name: "KURAITH",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  }));

  // Serve frontend static files in production
  const publicDir = join(__dirname, "..", "public");
  if (existsSync(publicDir)) {
    await app.register(fastifyStatic, {
      root: publicDir,
      prefix: "/",
      wildcard: false,
    });

    // SPA fallback — serve index.html for non-API routes
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api/")) {
        return reply.status(404).send({ error: "Not found" });
      }
      return reply.sendFile("index.html");
    });
  }

  return app;
}
