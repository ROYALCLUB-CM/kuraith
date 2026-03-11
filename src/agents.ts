/**
 * KURAITH Agent Registry
 * Defines supported AI agents and their installation paths
 */

export interface AgentConfig {
  name: string;
  displayName: string;
  detectPath: string;       // Check this path to detect if agent is installed
  installDir: string;       // Where to install skills
  skillExtension: string;   // File extension for skills
}

export const AGENTS: AgentConfig[] = [
  {
    name: "claude",
    displayName: "Claude Code",
    detectPath: "~/.claude/",
    installDir: "~/.claude/commands/",
    skillExtension: ".md",
  },
  {
    name: "codex",
    displayName: "Codex",
    detectPath: "~/.codex/",
    installDir: "~/.codex/skills/",
    skillExtension: ".md",
  },
  {
    name: "gemini",
    displayName: "Gemini CLI",
    detectPath: "~/.gemini/",
    installDir: "~/.gemini/commands/",
    skillExtension: ".md",
  },
  {
    name: "zed",
    displayName: "Zed AI",
    detectPath: "~/.config/zed/",
    installDir: "~/.config/zed/prompt_overrides/",
    skillExtension: ".md",
  },
  {
    name: "cursor",
    displayName: "Cursor",
    detectPath: ".cursor/",
    installDir: ".cursor/commands/",
    skillExtension: ".md",
  },
  {
    name: "roo",
    displayName: "Roo Code",
    detectPath: "~/.roo/",
    installDir: "~/.roo/commands/",
    skillExtension: ".md",
  },
  {
    name: "amp",
    displayName: "Amp CLI",
    detectPath: "~/.config/agents/",
    installDir: "~/.config/agents/skills/",
    skillExtension: ".md",
  },
  {
    name: "windsurf",
    displayName: "Windsurf",
    detectPath: ".windsurf/",
    installDir: ".windsurf/workflows/",
    skillExtension: ".md",
  },
];

export const AGENT_NAMES = AGENTS.map((a) => a.name);

export function getAgent(name: string): AgentConfig | undefined {
  return AGENTS.find((a) => a.name === name);
}
