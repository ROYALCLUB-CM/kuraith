import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer as createHttpServer } from "node:http";
import { z } from "zod";
import { prisma } from "./db/index.js";

import { handleSearch } from "./tools/search.js";
import { handleLearn } from "./tools/learn.js";
import { handleHandoff } from "./tools/handoff.js";
import { handleInbox } from "./tools/inbox.js";
import { handleReflect } from "./tools/reflect.js";
import { handleStats } from "./tools/stats.js";
import { handleTrace } from "./tools/trace.js";
import { handleSupersede } from "./tools/supersede.js";
import { handleRefine } from "./tools/refine.js";
import { handleOmega } from "./tools/omega.js";
import { handleWorkflow, handleCoordinate } from "./tools/workflow.js";

const MCP_PORT = parseInt(process.env.MCP_PORT || "47701");

async function getDefaultUserId(): Promise<string> {
  const user = await prisma.user.findFirst({ select: { id: true } });
  return user?.id || "unknown";
}

function createMcpInstance(): McpServer {
  const mcp = new McpServer({
    name: "KURAITH",
    version: "1.0.0",
  });

  mcp.tool(
    "kuraith_search",
    "Search KURAITH memory for knowledge, patterns, decisions, and learnings.",
    {
      query: z.string().describe("Search query"),
      type: z.enum(["knowledge", "decision", "pattern", "bug", "session"]).optional().describe("Filter by type"),
      project: z.string().optional().describe("Filter by project name"),
      limit: z.number().optional().describe("Max results (default 10)"),
      stage: z.enum(["raw", "refined", "gem"]).optional().describe("Filter by knowledge pipeline stage"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleSearch(args, userId);
    }
  );

  mcp.tool(
    "kuraith_learn",
    "Store a new learning, pattern, decision, or knowledge in KURAITH memory.",
    {
      title: z.string().describe("Short title for this knowledge"),
      content: z.string().describe("Detailed content to remember"),
      type: z.enum(["knowledge", "decision", "pattern", "bug"]).optional().describe("Type of knowledge"),
      concepts: z.array(z.string()).optional().describe("Related concepts/tags"),
      project: z.string().optional().describe("Project name"),
      stage: z.enum(["raw", "refined", "gem"]).optional().describe("Knowledge pipeline stage (default: raw)"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleLearn(args, userId);
    }
  );

  mcp.tool(
    "kuraith_handoff",
    "Create a handoff for the next session. Pass context and next steps to the next AI agent.",
    {
      context: z.string().describe("What was being worked on and current state"),
      nextSteps: z.array(z.string()).describe("List of next steps to continue"),
      warnings: z.array(z.string()).optional().describe("Warnings or things to watch out for"),
      project: z.string().optional().describe("Project name"),
      agent: z.string().optional().describe("Which agent is creating this handoff (claude, codex, gemini, etc.)"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleHandoff(args, userId);
    }
  );

  mcp.tool(
    "kuraith_inbox",
    "Check for pending handoffs from previous sessions. Use at the start of a new session.",
    {
      limit: z.number().optional().describe("Max items to retrieve (default 5)"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleInbox(args, userId);
    }
  );

  mcp.tool(
    "kuraith_reflect",
    "Reflect on patterns and learnings. Finds recurring themes and insights.",
    {
      project: z.string().optional().describe("Filter by project"),
      days: z.number().optional().describe("Look back N days (default 7)"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleReflect(args, userId);
    }
  );

  mcp.tool(
    "kuraith_stats",
    "Get KURAITH usage statistics: document counts, sessions, search activity, knowledge pipeline.",
    {
      project: z.string().optional().describe("Filter by project"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleStats(args, userId);
    }
  );

  mcp.tool(
    "kuraith_trace",
    "Trace connections between knowledge. Finds related documents and linked concepts.",
    {
      documentId: z.string().optional().describe("Start tracing from this document ID"),
      concept: z.string().optional().describe("Trace all documents with this concept"),
      depth: z.number().optional().describe("How many levels deep to trace (default 2)"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleTrace(args, userId);
    }
  );

  mcp.tool(
    "kuraith_supersede",
    "Replace outdated knowledge with updated version. Old document is archived, not deleted.",
    {
      oldDocumentId: z.string().describe("ID of the document to supersede"),
      title: z.string().describe("Title for the new version"),
      content: z.string().describe("Updated content"),
      concepts: z.array(z.string()).optional().describe("Updated concepts/tags"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleSupersede(args, userId);
    }
  );

  // --- New tools ---

  mcp.tool(
    "kuraith_refine",
    "Promote a document through the knowledge pipeline: raw → refined → gem. Use to curate high-value knowledge.",
    {
      documentId: z.string().describe("ID of the document to refine"),
      targetStage: z.enum(["refined", "gem"]).describe("Target stage to promote to"),
      notes: z.string().optional().describe("Refinement notes (why this was promoted)"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleRefine(args, userId);
    }
  );

  mcp.tool(
    "kuraith_omega",
    "Manage the local omega/ memory structure. Actions: init (create structure), sync (refresh from server), status (check state).",
    {
      action: z.enum(["init", "sync", "status"]).describe("Action: init, sync, or status"),
      path: z.string().optional().describe("Base path for omega/ directory (default: current directory)"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleOmega(args, userId);
    }
  );

  mcp.tool(
    "kuraith_workflow",
    "Manage multi-agent workflows. Actions: create, list, get, claim (assign task to agent), update (change task status).",
    {
      action: z.enum(["create", "list", "get", "claim", "update"]).describe("Action to perform"),
      name: z.string().optional().describe("Workflow name (for create)"),
      description: z.string().optional().describe("Workflow description (for create)"),
      tasks: z.array(z.object({
        title: z.string(),
        agent: z.string(),
        branch: z.string().optional(),
        description: z.string().optional(),
      })).optional().describe("Tasks with agent assignments (for create)"),
      workflowId: z.string().optional().describe("Workflow ID (for get)"),
      taskId: z.string().optional().describe("Task ID (for claim/update)"),
      status: z.string().optional().describe("New status (for update): pending, in_progress, completed, failed"),
      agent: z.string().optional().describe("Agent name (for claim)"),
      notes: z.string().optional().describe("Notes for task update"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleWorkflow(args, userId);
    }
  );

  mcp.tool(
    "kuraith_coordinate",
    "Send coordination messages between agents in a workflow. View workflow status or relay messages.",
    {
      workflowId: z.string().describe("Workflow ID"),
      message: z.string().optional().describe("Message to send"),
      fromAgent: z.string().optional().describe("Sending agent name"),
      toAgent: z.string().optional().describe("Target agent name (omit for broadcast)"),
    },
    async (args) => {
      const userId = await getDefaultUserId();
      return await handleCoordinate(args, userId);
    }
  );

  return mcp;
}

export async function startMCPServer() {
  const httpServer = createHttpServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", name: "KURAITH MCP", version: "1.0.0" }));
      return;
    }

    if (req.url === "/mcp") {
      // Browser GET → show info page
      if (req.method === "GET") {
        const accept = req.headers.accept || "";
        if (!accept.includes("text/event-stream")) {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KURAITH MCP</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0f; color: #e2e8f0; font-family: 'SF Mono', 'Fira Code', monospace; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .card { max-width: 520px; width: 100%; padding: 40px; }
  h1 { font-size: 28px; letter-spacing: 6px; color: #22d3ee; margin-bottom: 6px; }
  .sub { font-size: 12px; color: #64748b; margin-bottom: 32px; }
  .section { margin-bottom: 20px; }
  .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
  .status { display: inline-block; background: #065f46; color: #34d399; padding: 3px 10px; border-radius: 6px; font-size: 12px; }
  .tools { display: flex; flex-wrap: wrap; gap: 6px; }
  .tool { background: #1e293b; color: #94a3b8; padding: 4px 10px; border-radius: 6px; font-size: 11px; }
  .tool.new { background: #164e63; color: #22d3ee; }
  .info { font-size: 12px; color: #475569; line-height: 1.8; margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; }
  a { color: #22d3ee; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="card">
  <h1>KURAITH</h1>
  <p class="sub">黒+Wraith = เงาดำ — AI Memory & Skills System</p>

  <div class="section">
    <div class="label">Status</div>
    <span class="status">● Online</span>
  </div>

  <div class="section">
    <div class="label">17 Agents — 15 Skills — 12 MCP Tools</div>
    <div class="tools">
      <span class="tool">search</span>
      <span class="tool">learn</span>
      <span class="tool">handoff</span>
      <span class="tool">inbox</span>
      <span class="tool">reflect</span>
      <span class="tool">stats</span>
      <span class="tool">trace</span>
      <span class="tool">supersede</span>
      <span class="tool new">refine</span>
      <span class="tool new">omega</span>
      <span class="tool new">workflow</span>
      <span class="tool new">coordinate</span>
    </div>
  </div>

  <div class="section">
    <div class="label">Pipeline</div>
    <div class="tools">
      <span class="tool">raw</span>
      <span class="tool" style="background:#164e63;color:#22d3ee">→ refined</span>
      <span class="tool" style="background:#78350f;color:#fbbf24">→ gem</span>
    </div>
  </div>

  <div class="info">
    This is the MCP (Model Context Protocol) endpoint.<br>
    Connect via AI agents, not a browser.<br><br>
    Dashboard: <a href="http://localhost:47700">localhost:47700</a><br>
    Health: <a href="/health">/health</a>
  </div>
</div>
</body>
</html>`);
          return;
        }
      }

      const mcp = createMcpInstance();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await mcp.connect(transport);
      await transport.handleRequest(req, res);
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  httpServer.listen(MCP_PORT, "0.0.0.0", () => {
    console.log(`  🔌 MCP Server: http://0.0.0.0:${MCP_PORT}/mcp`);
  });

  return httpServer;
}
