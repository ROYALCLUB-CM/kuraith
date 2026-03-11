import { prisma } from "./db/index.js";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const OMEGA_DIRS = [
  "inbox",
  "memory",
  "memory/soul",
  "memory/learnings",
  "memory/sessions",
];

/**
 * Initialize the omega/ directory structure in the given basePath
 */
export function initOmega(basePath: string): string[] {
  const omegaRoot = join(basePath, "omega");
  const created: string[] = [];

  // Create directories
  for (const dir of OMEGA_DIRS) {
    const fullPath = join(omegaRoot, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      created.push(dir);
    }
  }

  // Write KURAITH.md from template
  const kuraithMdPath = join(omegaRoot, "KURAITH.md");
  const templatePath = join(__dirname, "templates", "KURAITH.md");
  if (existsSync(templatePath)) {
    const template = readFileSync(templatePath, "utf-8");
    writeFileSync(kuraithMdPath, template);
  } else {
    writeFileSync(kuraithMdPath, "# KURAITH\n\nAI Memory & Skills System\n");
  }

  // Write soul.md from template
  const soulMdPath = join(omegaRoot, "memory", "soul", "KURAITH.soul.md");
  const soulTemplatePath = join(__dirname, "templates", "soul.md");
  if (existsSync(soulTemplatePath)) {
    const template = readFileSync(soulTemplatePath, "utf-8");
    writeFileSync(soulMdPath, template);
  } else {
    writeFileSync(soulMdPath, "# KURAITH Soul\n\nIdentity and core values.\n");
  }

  return created;
}

/**
 * Sync server data to omega/ local cache
 */
export async function syncOmega(basePath: string, userId: string): Promise<{ synced: Record<string, number> }> {
  const omegaRoot = join(basePath, "omega");

  if (!existsSync(omegaRoot)) {
    initOmega(basePath);
  }

  const synced: Record<string, number> = { inbox: 0, learnings: 0, sessions: 0 };

  // Sync inbox (latest handoffs)
  const handoffs = await prisma.handoff.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  for (const h of handoffs) {
    const filename = `${h.createdAt.toISOString().slice(0, 10)}_${h.id.slice(0, 8)}.md`;
    const filepath = join(omegaRoot, "inbox", filename);
    const content = `# Handoff ${h.id}\n\n**Date:** ${h.createdAt.toISOString()}\n\n## Context\n${h.context}\n\n## Next Steps\n${h.nextSteps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}\n\n## Warnings\n${(h.warnings as string[]).map((w: string) => `- ${w}`).join("\n") || "None"}\n`;
    writeFileSync(filepath, content);
    synced.inbox++;
  }

  // Sync learnings (gem + refined first, then recent raw)
  const learnings = await prisma.document.findMany({
    where: { userId, supersededBy: null, type: { in: ["knowledge", "pattern", "decision"] } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  for (const l of learnings) {
    const safeTitle = l.title.replace(/[^a-zA-Z0-9\u0E00-\u0E7F_-]/g, "_").slice(0, 50);
    const filename = `${safeTitle}_${l.id.slice(0, 8)}.md`;
    const filepath = join(omegaRoot, "memory", "learnings", filename);
    const stage = (l as any).stage || "raw";
    const content = `# ${l.title}\n\n**Type:** ${l.type} | **Stage:** ${stage}\n**Concepts:** ${l.concepts.join(", ") || "none"}\n**Project:** ${l.project || "none"}\n**Created:** ${l.createdAt.toISOString()}\n\n---\n\n${l.content}\n`;
    writeFileSync(filepath, content);
    synced.learnings++;
  }

  // Sync recent sessions
  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: 10,
  });

  for (const s of sessions) {
    const date = s.startedAt.toISOString().slice(0, 10);
    const filename = `${date}_${s.id.slice(0, 8)}.md`;
    const filepath = join(omegaRoot, "memory", "sessions", filename);
    const content = `# Session ${s.id}\n\n**Agent:** ${s.agent}\n**Project:** ${s.project || "none"}\n**Started:** ${s.startedAt.toISOString()}\n**Ended:** ${s.endedAt?.toISOString() || "ongoing"}\n\n## Summary\n${s.summary || "No summary"}\n\n## Discoveries\n${s.discoveries.map((d: string) => `- ${d}`).join("\n") || "None"}\n`;
    writeFileSync(filepath, content);
    synced.sessions++;
  }

  return { synced };
}

/**
 * Get omega status
 */
export function getOmegaStatus(basePath: string): { exists: boolean; dirs: string[] } {
  const omegaRoot = join(basePath, "omega");
  if (!existsSync(omegaRoot)) {
    return { exists: false, dirs: [] };
  }

  const dirs: string[] = [];
  for (const dir of OMEGA_DIRS) {
    if (existsSync(join(omegaRoot, dir))) {
      dirs.push(dir);
    }
  }

  return { exists: true, dirs };
}
