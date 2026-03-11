#!/bin/bash
# KURAITH Skills Installer — Multi-Agent + Profile Support
# Usage:
#   bash install.sh                          # auto-detect agents, full profile
#   bash install.sh --profile seed           # install seed profile to all detected agents
#   bash install.sh --agent claude            # install to Claude Code only
#   bash install.sh --agent claude --profile standard

set -e

SKILLS_DIR="$(cd "$(dirname "$0")" && pwd)"

# ─── Defaults ───
PROFILE="full"
TARGET_AGENT=""

# ─── Parse args ───
while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    --agent)
      TARGET_AGENT="$2"
      shift 2
      ;;
    --help|-h)
      echo ""
      echo "  KURAITH Skills Installer"
      echo ""
      echo "  Usage: bash install.sh [options]"
      echo ""
      echo "  Options:"
      echo "    --profile <seed|standard|full>  Choose skill set (default: full)"
      echo "    --agent <name>                  Install for specific agent only"
      echo "    --help                          Show this help"
      echo ""
      echo "  Profiles:"
      echo "    seed       7 skills: recap, forward, learn, trace, feel, awaken, dig"
      echo "    standard  11 skills: seed + rrr, standup, who-are-you, watch"
      echo "    full      15 skills: standard + deep-research, birth, philosophy, speak"
      echo ""
      echo "  Agents (17): claude, codex, gemini, zed, cursor, roo, amp, windsurf,"
      echo "               goose, kilo, cline, aider, continue, opencode, copilot,"
      echo "               antigravity, openclaw"
      echo ""
      exit 0
      ;;
    *)
      echo "Unknown option: $1 (use --help)"
      exit 1
      ;;
  esac
done

# ─── Profile definitions ───
case "$PROFILE" in
  seed)
    SKILLS=(recap forward learn trace feel awaken dig)
    ;;
  standard)
    SKILLS=(recap forward learn trace feel awaken dig rrr standup who-are-you watch)
    ;;
  full)
    SKILLS=(recap forward learn trace feel awaken dig rrr standup who-are-you watch deep-research birth philosophy speak)
    ;;
  *)
    echo "  Unknown profile: $PROFILE (use: seed, standard, full)"
    exit 1
    ;;
esac

# ─── Agent definitions ───
# Format: name|displayName|detectPath|installDir
AGENT_DEFS=(
  "claude|Claude Code|$HOME/.claude/|$HOME/.claude/commands/"
  "codex|Codex|$HOME/.codex/|$HOME/.codex/skills/"
  "gemini|Gemini CLI|$HOME/.gemini/|$HOME/.gemini/commands/"
  "zed|Zed AI|$HOME/.config/zed/|$HOME/.config/zed/prompt_overrides/"
  "cursor|Cursor|$PWD/.cursor/|$PWD/.cursor/commands/"
  "roo|Roo Code|$HOME/.roo/|$HOME/.roo/commands/"
  "amp|Amp CLI|$HOME/.config/agents/|$HOME/.config/agents/skills/"
  "windsurf|Windsurf|$PWD/.windsurf/|$PWD/.windsurf/workflows/"
  "goose|Goose|$HOME/.goose/|$HOME/.goose/commands/"
  "kilo|Kilo Code|$HOME/.kilo/|$HOME/.kilo/commands/"
  "cline|Cline|$HOME/.cline/|$HOME/.cline/commands/"
  "aider|Aider|$HOME/.aider/|$HOME/.aider/commands/"
  "continue|Continue|$HOME/.continue/|$HOME/.continue/commands/"
  "opencode|OpenCode|$HOME/.opencode/|$HOME/.opencode/commands/"
  "copilot|GitHub Copilot|$HOME/.config/github-copilot/|$HOME/.config/github-copilot/commands/"
  "antigravity|Antigravity|$HOME/.antigravity/|$HOME/.antigravity/commands/"
  "openclaw|OpenClaw|$HOME/.openclaw/|$HOME/.openclaw/commands/"
)

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║     KURAITH Skills Installer         ║"
echo "  ╠══════════════════════════════════════╣"
echo "  ║  Profile: $(printf '%-27s' "$PROFILE")║"
echo "  ║  Skills:  $(printf '%-27s' "${#SKILLS[@]}")║"
echo "  ╚══════════════════════════════════════╝"
echo ""

total_installed=0
agents_found=0

for agent_def in "${AGENT_DEFS[@]}"; do
  IFS='|' read -r name display detect install_dir <<< "$agent_def"

  # Skip if targeting specific agent
  if [ -n "$TARGET_AGENT" ] && [ "$TARGET_AGENT" != "$name" ]; then
    continue
  fi

  # Check if agent is installed (or forced via --agent)
  if [ -n "$TARGET_AGENT" ] || [ -d "$detect" ]; then
    ((agents_found++))
    echo "  ┌─ $display"

    # Create install directory
    mkdir -p "$install_dir"

    installed=0
    for skill in "${SKILLS[@]}"; do
      src="$SKILLS_DIR/$skill/SKILL.md"
      dest="$install_dir/$skill.md"

      if [ -f "$src" ]; then
        cp "$src" "$dest"
        echo "  │  ✅ /$skill"
        ((installed++))
      else
        echo "  │  ❌ /$skill (not found)"
      fi
    done

    echo "  └─ $installed skills installed to $install_dir"
    echo ""
    total_installed=$((total_installed + installed))
  fi
done

if [ "$agents_found" -eq 0 ]; then
  if [ -n "$TARGET_AGENT" ]; then
    echo "  Agent '$TARGET_AGENT' not recognized."
    echo "  Available: claude, codex, gemini, zed, cursor, roo, amp, windsurf,"
    echo "             goose, kilo, cline, aider, continue, opencode, copilot,"
    echo "             antigravity, openclaw"
  else
    echo "  No agents detected on this machine."
    echo "  Use --agent <name> to force install for a specific agent."
  fi
  echo ""
  exit 1
fi

echo "  ══════════════════════════════════════"
echo "  Total: $total_installed skills → $agents_found agent(s)"
echo "  Restart your agents to use them!"
echo ""
