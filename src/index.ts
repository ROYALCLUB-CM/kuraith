import { createServer } from "./server.js";
import { startMCPServer } from "./mcp.js";
import { connectDB, disconnectDB } from "./db/index.js";

const PORT = parseInt(process.env.PORT || "47700");
const HOST = process.env.HOST || "0.0.0.0";

async function main() {
  console.log("");
  console.log("  ╔══════════════════════════════════════╗");
  console.log("  ║         KURAITH — เงาที่ไม่เคยลืม        ║");
  console.log("  ╚══════════════════════════════════════╝");
  console.log("");

  // Connect database
  await connectDB();

  // Create & start API server
  const app = await createServer();
  await app.listen({ port: PORT, host: HOST });
  console.log(`  🌐 API Server: http://${HOST}:${PORT}`);
  console.log(`  📡 Health:     http://${HOST}:${PORT}/health`);

  // Start MCP server
  const mcpServer = await startMCPServer();
  console.log("");

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n  Shutting down...");
    mcpServer.close();
    await app.close();
    await disconnectDB();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("  ❌ Failed to start:", err);
  process.exit(1);
});
