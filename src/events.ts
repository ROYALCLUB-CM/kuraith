/**
 * KURAITH Server-Sent Events (SSE) — Real-time sync
 * Dashboard connects via EventSource, server pushes events when data changes
 */

import { FastifyInstance, FastifyReply } from "fastify";

// Connected SSE clients
const clients = new Set<FastifyReply>();

// Emit event to all connected clients
export function emitEvent(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.raw.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

// SSE route
export async function sseRoutes(app: FastifyInstance) {
  app.get("/events", async (request, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    // Send initial heartbeat
    reply.raw.write(`event: connected\ndata: {"status":"ok"}\n\n`);

    clients.add(reply);

    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(`event: heartbeat\ndata: {"t":${Date.now()}}\n\n`);
      } catch {
        clearInterval(heartbeat);
        clients.delete(reply);
      }
    }, 30000);

    // Cleanup on disconnect
    request.raw.on("close", () => {
      clearInterval(heartbeat);
      clients.delete(reply);
    });
  });
}

// Helper to get connected client count
export function getClientCount(): number {
  return clients.size;
}
