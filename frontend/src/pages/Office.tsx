import { useEffect, useState, useCallback } from "react";
import { api, onEvent } from "../lib/api";
import {
  Building2,
  Monitor,
  Coffee,
  MessageSquare,
  Zap,
  ArrowRight,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

// ─── Types ───

interface FleetAgent {
  name: string;
  displayName: string;
  sessions: number;
  tasks: number;
  tasksCompleted: number;
  tasksInProgress: number;
  lastActivity: string | null;
}

interface Communication {
  id: string;
  agent: string;
  project: string | null;
  context: string;
  nextSteps: string[];
  createdAt: string;
  read: boolean;
}

// ─── Room & Desk Config ───

interface Room {
  name: string;
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  glowColor: string;
  agents: string[];
}

const ROOMS: Room[] = [
  {
    name: "Code Lab",
    icon: "{ }",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
    glowColor: "shadow-cyan-500/10",
    agents: ["claude", "codex", "cursor", "copilot", "cline", "aider"],
  },
  {
    name: "Research Bay",
    icon: "R",
    color: "text-blue-400",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
    glowColor: "shadow-blue-500/10",
    agents: ["gemini", "amp", "continue", "opencode"],
  },
  {
    name: "Ops Center",
    icon: "O",
    color: "text-green-400",
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
    glowColor: "shadow-green-500/10",
    agents: ["roo", "windsurf", "goose", "kilo"],
  },
  {
    name: "Special Ops",
    icon: "X",
    color: "text-purple-400",
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
    glowColor: "shadow-purple-500/10",
    agents: ["zed", "antigravity", "openclaw"],
  },
];

// Agent visual config
const agentEmoji: Record<string, string> = {
  claude: "CL",
  codex: "CX",
  gemini: "GM",
  zed: "ZD",
  cursor: "CR",
  roo: "RO",
  amp: "AM",
  windsurf: "WS",
  goose: "GS",
  kilo: "KL",
  cline: "CN",
  aider: "AD",
  continue: "CT",
  opencode: "OC",
  copilot: "CP",
  antigravity: "AG",
  openclaw: "OW",
};

const agentAccent: Record<string, { text: string; bg: string; ring: string; glow: string }> = {
  claude:      { text: "text-cyan-400",    bg: "bg-cyan-500",    ring: "ring-cyan-400/40",    glow: "shadow-cyan-500/30" },
  codex:       { text: "text-green-400",   bg: "bg-green-500",   ring: "ring-green-400/40",   glow: "shadow-green-500/30" },
  gemini:      { text: "text-blue-400",    bg: "bg-blue-500",    ring: "ring-blue-400/40",    glow: "shadow-blue-500/30" },
  zed:         { text: "text-orange-400",  bg: "bg-orange-500",  ring: "ring-orange-400/40",  glow: "shadow-orange-500/30" },
  cursor:      { text: "text-purple-400",  bg: "bg-purple-500",  ring: "ring-purple-400/40",  glow: "shadow-purple-500/30" },
  roo:         { text: "text-pink-400",    bg: "bg-pink-500",    ring: "ring-pink-400/40",    glow: "shadow-pink-500/30" },
  amp:         { text: "text-yellow-400",  bg: "bg-yellow-500",  ring: "ring-yellow-400/40",  glow: "shadow-yellow-500/30" },
  windsurf:    { text: "text-teal-400",    bg: "bg-teal-500",    ring: "ring-teal-400/40",    glow: "shadow-teal-500/30" },
  goose:       { text: "text-amber-400",   bg: "bg-amber-500",   ring: "ring-amber-400/40",   glow: "shadow-amber-500/30" },
  kilo:        { text: "text-lime-400",    bg: "bg-lime-500",    ring: "ring-lime-400/40",    glow: "shadow-lime-500/30" },
  cline:       { text: "text-rose-400",    bg: "bg-rose-500",    ring: "ring-rose-400/40",    glow: "shadow-rose-500/30" },
  aider:       { text: "text-indigo-400",  bg: "bg-indigo-500",  ring: "ring-indigo-400/40",  glow: "shadow-indigo-500/30" },
  continue:    { text: "text-emerald-400", bg: "bg-emerald-500", ring: "ring-emerald-400/40", glow: "shadow-emerald-500/30" },
  opencode:    { text: "text-sky-400",     bg: "bg-sky-500",     ring: "ring-sky-400/40",     glow: "shadow-sky-500/30" },
  copilot:     { text: "text-violet-400",  bg: "bg-violet-500",  ring: "ring-violet-400/40",  glow: "shadow-violet-500/30" },
  antigravity: { text: "text-fuchsia-400", bg: "bg-fuchsia-500", ring: "ring-fuchsia-400/40", glow: "shadow-fuchsia-500/30" },
  openclaw:    { text: "text-red-400",     bg: "bg-red-500",     ring: "ring-red-400/40",     glow: "shadow-red-500/30" },
};

const defaultAccent = { text: "text-gray-400", bg: "bg-gray-500", ring: "ring-gray-400/40", glow: "shadow-gray-500/30" };

type AgentStatus = "working" | "idle" | "offline";

function getAgentStatus(agent: FleetAgent): AgentStatus {
  if (agent.tasksInProgress > 0) return "working";
  if (agent.sessions > 0) return "idle";
  return "offline";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Agent Desk Component ───

function AgentDesk({
  agent,
  onClick,
  selected,
}: {
  agent: FleetAgent;
  onClick: () => void;
  selected: boolean;
}) {
  const status = getAgentStatus(agent);
  const accent = agentAccent[agent.name] || defaultAccent;
  const abbr = agentEmoji[agent.name] || agent.name.substring(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`relative group transition-all duration-300 ${
        selected ? "scale-105" : "hover:scale-105"
      }`}
    >
      {/* Desk surface */}
      <div
        className={`relative w-20 h-20 rounded-xl border transition-all duration-300 ${
          status === "working"
            ? `bg-gray-900/80 border-gray-700 shadow-lg ${accent.glow} ring-2 ${accent.ring}`
            : status === "idle"
            ? "bg-gray-900/60 border-gray-700/60 shadow-md"
            : "bg-gray-900/30 border-gray-800/40"
        } ${selected ? `ring-2 ${accent.ring}` : ""}`}
      >
        {/* Monitor glow for working agents */}
        {status === "working" && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className={`absolute inset-x-2 top-2 h-8 rounded-md ${accent.bg} opacity-10 animate-pulse`} />
          </div>
        )}

        {/* Agent avatar */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold tracking-wider transition-all ${
              status === "offline"
                ? "bg-gray-800/50 text-gray-600"
                : `bg-gray-800 ${accent.text}`
            }`}
          >
            {abbr}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === "working"
                  ? `${accent.bg} animate-pulse`
                  : status === "idle"
                  ? "bg-green-400"
                  : "bg-gray-700"
              }`}
            />
            <span
              className={`text-[9px] ${
                status === "offline" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {status === "working"
                ? "busy"
                : status === "idle"
                ? "ready"
                : "off"}
            </span>
          </div>
        </div>

        {/* Task badge */}
        {agent.tasksInProgress > 0 && (
          <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full ${accent.bg} flex items-center justify-center`}>
            <span className="text-[9px] font-bold text-white">{agent.tasksInProgress}</span>
          </div>
        )}
      </div>

      {/* Agent name */}
      <p
        className={`text-[10px] mt-1.5 text-center truncate w-20 ${
          status === "offline" ? "text-gray-600" : accent.text
        }`}
      >
        {agent.displayName}
      </p>
    </button>
  );
}

// ─── Room Component ───

function RoomSection({
  room,
  agents,
  selectedAgent,
  onSelectAgent,
}: {
  room: Room;
  agents: FleetAgent[];
  selectedAgent: string | null;
  onSelectAgent: (name: string) => void;
}) {
  const activeCount = agents.filter((a) => getAgentStatus(a) !== "offline").length;

  return (
    <div
      className={`relative border ${room.borderColor} ${room.bgColor} rounded-2xl p-5 transition-all shadow-lg ${room.glowColor}`}
    >
      {/* Room header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg bg-gray-900/60 flex items-center justify-center text-xs font-mono font-bold ${room.color}`}
          >
            {room.icon}
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${room.color}`}>{room.name}</h3>
            <p className="text-[10px] text-gray-500">
              {activeCount}/{agents.length} active
            </p>
          </div>
        </div>
        {activeCount > 0 && (
          <div className="flex items-center gap-1">
            <Wifi size={10} className={room.color} />
          </div>
        )}
      </div>

      {/* Agent desks grid */}
      <div className="flex flex-wrap gap-3 justify-center">
        {agents.map((agent) => (
          <AgentDesk
            key={agent.name}
            agent={agent}
            selected={selectedAgent === agent.name}
            onClick={() => onSelectAgent(agent.name)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Agent Detail Panel ───

function AgentDetailPanel({
  agent,
  onClose,
}: {
  agent: FleetAgent;
  onClose: () => void;
}) {
  const status = getAgentStatus(agent);
  const accent = agentAccent[agent.name] || defaultAccent;
  const abbr = agentEmoji[agent.name] || "??";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-in slide-in-from-right">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold tracking-wider bg-gray-800 ${accent.text}`}
          >
            {abbr}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100">
              {agent.displayName}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "working"
                    ? `${accent.bg} animate-pulse`
                    : status === "idle"
                    ? "bg-green-400"
                    : "bg-gray-700"
                }`}
              />
              <span className="text-[11px] text-gray-500 capitalize">{status}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-400 text-lg"
        >
          x
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-100">{agent.sessions}</p>
          <p className="text-[10px] text-gray-500">Sessions</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-100">{agent.tasks}</p>
          <p className="text-[10px] text-gray-500">Tasks</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-green-400">{agent.tasksCompleted}</p>
          <p className="text-[10px] text-gray-500">Completed</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-cyan-400">{agent.tasksInProgress}</p>
          <p className="text-[10px] text-gray-500">In Progress</p>
        </div>
      </div>

      {agent.lastActivity && (
        <p className="text-[11px] text-gray-500 mt-3 text-center">
          Last seen: {timeAgo(agent.lastActivity)}
        </p>
      )}

      {/* Activity bar */}
      {agent.tasks > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Progress</span>
            <span>{agent.tasksCompleted}/{agent.tasks}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${accent.bg} rounded-full transition-all`}
              style={{
                width: `${agent.tasks ? (agent.tasksCompleted / agent.tasks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Activity Ticker ───

function ActivityTicker({ communications }: { communications: Communication[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (communications.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % communications.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [communications.length]);

  if (communications.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-600 text-xs">
        <WifiOff size={12} />
        No recent activity
      </div>
    );
  }

  const c = communications[currentIdx];
  const accent = agentAccent[c.agent] || defaultAccent;

  return (
    <div className="flex items-center gap-3 text-xs overflow-hidden">
      <div className="flex items-center gap-1.5 shrink-0">
        <Zap size={10} className="text-cyan-500" />
        <span className={`font-semibold ${accent.text}`}>{c.agent}</span>
        <ArrowRight size={10} className="text-gray-600" />
      </div>
      <p className="text-gray-400 truncate">{c.context}</p>
      <span className="text-gray-600 shrink-0">{timeAgo(c.createdAt)}</span>
      <span className="text-gray-700 shrink-0">
        {currentIdx + 1}/{communications.length}
      </span>
    </div>
  );
}

// ─── Main Page ───

export default function OfficePage() {
  const [data, setData] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [clock, setClock] = useState(new Date());

  const fetchData = useCallback(() => {
    api.missionControl().then(setData);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    const unsub = onEvent("*", fetchData); // real-time refresh on any event
    return () => { clearInterval(interval); unsub(); };
  }, [fetchData]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <RefreshCw size={16} className="animate-spin mr-2" />
        Opening office...
      </div>
    );
  }

  const { fleet, communications, stats } = data;
  const fleetMap: Record<string, FleetAgent> = {};
  for (const f of fleet) fleetMap[f.name] = f;

  const selectedAgentData = selectedAgent ? fleetMap[selectedAgent] : null;

  const totalWorking = fleet.filter((f: FleetAgent) => f.tasksInProgress > 0).length;
  const totalIdle = fleet.filter(
    (f: FleetAgent) => f.sessions > 0 && f.tasksInProgress === 0
  ).length;
  const totalOffline = fleet.length - totalWorking - totalIdle;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-800">
            <Building2 size={18} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-100 tracking-wide">
              KURAITH Office
            </h1>
            <p className="text-[11px] text-gray-500">
              Virtual workspace &mdash; {fleet.length} agents registered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Status pills */}
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-gray-400">{totalWorking} working</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-400">{totalIdle} idle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-700" />
              <span className="text-gray-500">{totalOffline} off</span>
            </div>
          </div>

          {/* Clock */}
          <div className="text-right">
            <p className="text-sm font-mono text-gray-300">
              {clock.toLocaleTimeString("en-US", { hour12: false })}
            </p>
            <p className="text-[10px] text-gray-600">
              {clock.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Office Floor ─── */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Rooms */}
        <div className="flex-1 grid grid-cols-2 gap-4 content-start overflow-y-auto">
          {ROOMS.map((room) => {
            const roomAgents = room.agents
              .map((name) => fleetMap[name])
              .filter(Boolean);
            return (
              <RoomSection
                key={room.name}
                room={room}
                agents={roomAgents}
                selectedAgent={selectedAgent}
                onSelectAgent={(name) =>
                  setSelectedAgent(selectedAgent === name ? null : name)
                }
              />
            );
          })}
        </div>

        {/* Side panel */}
        <div className="w-64 shrink-0 flex flex-col gap-4">
          {/* Agent detail or summary */}
          {selectedAgentData ? (
            <AgentDetailPanel
              agent={selectedAgentData}
              onClose={() => setSelectedAgent(null)}
            />
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Monitor size={14} />
                Office Summary
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Agents</span>
                  <span className="text-gray-200 font-semibold">
                    {stats.totalAgents}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Active</span>
                  <span className="text-cyan-400 font-semibold">
                    {stats.activeAgents}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Sessions</span>
                  <span className="text-gray-200 font-semibold">
                    {stats.totalSessions}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Active Workflows</span>
                  <span className="text-green-400 font-semibold">
                    {stats.activeWorkflows}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Tasks Done</span>
                  <span className="text-gray-200 font-semibold">
                    {stats.completedTasks}/{stats.totalTasks}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recent handoffs */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <MessageSquare size={14} />
              Handoffs
            </h3>
            {communications.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-6">
                No handoffs yet
              </p>
            ) : (
              <div className="space-y-3">
                {communications.slice(0, 8).map((c: Communication) => {
                  const accent = agentAccent[c.agent] || defaultAccent;
                  return (
                    <div
                      key={c.id}
                      className="border-b border-gray-800/50 pb-2.5 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-semibold ${accent.text}`}>
                          {c.agent}
                        </span>
                        <span className="text-[9px] text-gray-600">
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                        {c.context}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Activity Ticker Bar ─── */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <Coffee size={12} className="text-gray-500" />
          <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
            Live
          </span>
        </div>
        <div className="w-px h-4 bg-gray-800" />
        <div className="flex-1 overflow-hidden">
          <ActivityTicker communications={communications} />
        </div>
      </div>
    </div>
  );
}
