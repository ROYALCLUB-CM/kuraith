import { initOmega, syncOmega, getOmegaStatus } from "../omega.js";
import { prisma } from "../db/index.js";

export async function handleOmega(args: {
  action: string;
  path?: string;
}, userId: string) {
  const basePath = args.path || process.cwd();

  switch (args.action) {
    case "init": {
      const created = initOmega(basePath);
      await prisma.activityLog.create({
        data: { userId, action: "omega.init", details: `Initialized omega/ at ${basePath}` },
      });
      return {
        content: [{
          type: "text" as const,
          text: `Omega initialized at ${basePath}/omega/\n\nCreated directories:\n${created.map((d) => `  + ${d}`).join("\n") || "  (all directories already existed)"}\n\nStructure:\n  omega/\n  ├── inbox/\n  ├── memory/\n  │   ├── soul/\n  │   ├── learnings/\n  │   └── sessions/\n  └── KURAITH.md`,
        }],
      };
    }

    case "sync": {
      const result = await syncOmega(basePath, userId);
      await prisma.activityLog.create({
        data: { userId, action: "omega.sync", details: `Synced: ${JSON.stringify(result.synced)}` },
      });
      return {
        content: [{
          type: "text" as const,
          text: `Omega synced at ${basePath}/omega/\n\nSynced:\n  Inbox: ${result.synced.inbox} handoffs\n  Learnings: ${result.synced.learnings} documents\n  Sessions: ${result.synced.sessions} sessions`,
        }],
      };
    }

    case "status": {
      const status = getOmegaStatus(basePath);
      return {
        content: [{
          type: "text" as const,
          text: status.exists
            ? `Omega exists at ${basePath}/omega/\n\nDirectories: ${status.dirs.join(", ")}`
            : `Omega not initialized. Run kuraith_omega with action="init" to create.`,
        }],
      };
    }

    default:
      return {
        content: [{
          type: "text" as const,
          text: `Unknown action: ${args.action}. Use: init, sync, or status`,
        }],
      };
  }
}
