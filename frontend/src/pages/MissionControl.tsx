import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  Radio,
  Users,
  Activity,
  Zap,
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

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
  warnings: string[];
  createdAt: string;
  read: boolean;
}

const statusIcon: Record<string, any> = {
  pending: Circle,
  in_progress: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

const statusColor: Record<string, string> = {
  pending: "text-gray-500",
  in_progress: "text-cyan-400",
  completed: "text-green-400",
  failed: "text-red-400",
};

const agentColors: Record<string, string> = {
  claude: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30",
  codex: "from-green-500/20 to-green-600/5 border-green-500/30",
  gemini: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  zed: "from-orange-500/20 to-orange-600/5 border-orange-500/30",
  cursor: "from-purple-500/20 to-purple-600/5 border-purple-500/30",
  roo: "from-pink-500/20 to-pink-600/5 border-pink-500/30",
  amp: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
  windsurf: "from-teal-500/20 to-teal-600/5 border-teal-500/30",
};

const agentTextColors: Record<string, string> = {
  claude: "text-cyan-400",
  codex: "text-green-400",
  gemini: "text-blue-400",
  zed: "text-orange-400",
  cursor: "text-purple-400",
  roo: "text-pink-400",
  amp: "text-yellow-400",
  windsurf: "text-teal-400",
};

function AgentCard({ agent }: { agent: FleetAgent }) {
  const isActive = agent.sessions > 0;
  const gradient = isActive
    ? agentColors[agent.name] || "from-gray-500/20 to-gray-600/5 border-gray-500/30"
    : "from-gray-800/50 to-gray-900/50 border-gray-800";
  const textColor = agentTextColors[agent.name] || "text-gray-400";

  return (
    <div
      className={`bg-gradient-to-br ${gradient} border rounded-xl p-4 transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold tracking-wider ${
              isActive
                ? `bg-gray-900/50 ${textColor}`
                : "bg-gray-800/50 text-gray-600"
            }`}
          >
            {agent.displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span
              className={`text-sm font-semibold ${
                isActive ? "text-gray-100" : "text-gray-500"
              }`}
            >
              {agent.displayName}
            </span>
          </div>
        </div>
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isActive
              ? agent.tasksInProgress > 0
                ? "bg-cyan-400 animate-pulse"
                : "bg-green-400"
              : "bg-gray-700"
          }`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="text-center bg-gray-900/30 rounded-lg py-1.5">
          <p
            className={`text-lg font-bold ${
              isActive ? "text-gray-100" : "text-gray-600"
            }`}
          >
            {agent.sessions}
          </p>
          <p className="text-[10px] text-gray-500">sessions</p>
        </div>
        <div className="text-center bg-gray-900/30 rounded-lg py-1.5">
          <p
            className={`text-lg font-bold ${
              isActive ? "text-gray-100" : "text-gray-600"
            }`}
          >
            {agent.tasks}
          </p>
          <p className="text-[10px] text-gray-500">tasks</p>
        </div>
      </div>

      {agent.lastActivity && (
        <p className="text-[10px] text-gray-600 mt-2.5 text-center">
          {timeAgo(agent.lastActivity)}
        </p>
      )}
    </div>
  );
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

export default function MissionControlPage() {
  const [data, setData] = useState<any>(null);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  useEffect(() => {
    api.missionControl().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 size={20} className="animate-spin mr-2" />
        Initializing Mission Control...
      </div>
    );
  }

  const { fleet, workflows, communications, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Radio size={20} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">
                Mission Control
              </h1>
              <p className="text-sm text-gray-500">Agent fleet overview</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">ONLINE</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Users size={16} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-100">
              {stats.activeAgents}
              <span className="text-sm font-normal text-gray-500">
                /{stats.totalAgents}
              </span>
            </p>
            <p className="text-[10px] text-gray-500">Active Agents</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Activity size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-100">
              {stats.totalSessions}
            </p>
            <p className="text-[10px] text-gray-500">Total Sessions</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Zap size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-100">
              {stats.activeWorkflows}
            </p>
            <p className="text-[10px] text-gray-500">Active Workflows</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <CheckCircle2 size={16} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-100">
              {stats.completedTasks}
              <span className="text-sm font-normal text-gray-500">
                /{stats.totalTasks}
              </span>
            </p>
            <p className="text-[10px] text-gray-500">Tasks Done</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <MessageSquare size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-100">
              {communications.length}
            </p>
            <p className="text-[10px] text-gray-500">Handoffs</p>
          </div>
        </div>
      </div>

      {/* Fleet Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Users size={14} />
          Agent Fleet
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {fleet.map((agent: FleetAgent) => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      </div>

      {/* Two-column layout: Operations + Communications */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active Operations */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Zap size={14} />
            Operations
          </h2>

          {workflows.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8">
              No workflows yet
            </p>
          ) : (
            <div className="space-y-3">
              {workflows.map((w: any) => {
                const tasks = w.tasks || [];
                const done = tasks.filter(
                  (t: any) => t.status === "completed"
                ).length;
                const pct = tasks.length ? (done / tasks.length) * 100 : 0;
                const Icon = statusIcon[w.status] || Circle;
                const isExpanded = expandedWorkflow === w.id;

                return (
                  <div key={w.id}>
                    <div
                      onClick={() =>
                        setExpandedWorkflow(isExpanded ? null : w.id)
                      }
                      className="cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon
                            size={14}
                            className={`${statusColor[w.status]} ${
                              w.status === "in_progress" ? "animate-spin" : ""
                            }`}
                          />
                          <span className="text-sm text-gray-200 group-hover:text-cyan-400 transition-colors">
                            {w.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {done}/{tasks.length}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {isExpanded && tasks.length > 0 && (
                      <div className="mt-2 ml-5 space-y-1.5">
                        {tasks.map((t: any) => {
                          const TIcon = statusIcon[t.status] || Circle;
                          const agentColor =
                            agentTextColors[t.agent] || "text-gray-400";
                          return (
                            <div
                              key={t.id}
                              className="flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <TIcon
                                  size={10}
                                  className={statusColor[t.status]}
                                />
                                <span className="text-gray-400">{t.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={agentColor}>
                                  {t.agentDisplay || t.agent}
                                </span>
                                {t.branch && (
                                  <span className="text-cyan-600 bg-cyan-500/5 px-1 rounded text-[10px]">
                                    {t.branch}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Communication Log */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <MessageSquare size={14} />
            Communication Log
          </h2>

          {communications.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8">
              No handoffs yet
            </p>
          ) : (
            <div className="space-y-3">
              {communications.slice(0, 10).map((c: Communication) => {
                const agentColor =
                  agentTextColors[c.agent] || "text-gray-400";
                return (
                  <div
                    key={c.id}
                    className="border-b border-gray-800/50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${agentColor}`}
                        >
                          {c.agent}
                        </span>
                        <ArrowRight size={10} className="text-gray-600" />
                        <span className="text-xs text-gray-500">
                          next agent
                        </span>
                        {!c.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-600">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {c.context}
                    </p>
                    <div className="flex gap-3 mt-1">
                      {c.nextSteps.length > 0 && (
                        <span className="text-[10px] text-cyan-500/70">
                          {c.nextSteps.length} next steps
                        </span>
                      )}
                      {c.warnings.length > 0 && (
                        <span className="text-[10px] text-amber-500/70 flex items-center gap-0.5">
                          <AlertTriangle size={8} />
                          {c.warnings.length} warnings
                        </span>
                      )}
                      {c.project && (
                        <span className="text-[10px] text-gray-600">
                          {c.project}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Activity size={14} />
          Agent Performance
        </h2>

        {(() => {
          const activeFleet = fleet.filter(
            (f: FleetAgent) => f.sessions > 0 || f.tasks > 0
          );
          if (activeFleet.length === 0) {
            return (
              <p className="text-sm text-gray-600 text-center py-4">
                No agent activity yet
              </p>
            );
          }

          const maxSessions = Math.max(
            ...activeFleet.map((f: FleetAgent) => f.sessions),
            1
          );

          return (
            <div className="space-y-3">
              {activeFleet.map((agent: FleetAgent) => {
                const barWidth = (agent.sessions / maxSessions) * 100;
                const agentColor =
                  agentTextColors[agent.name] || "text-gray-400";
                const barBg = agentColor.replace("text-", "bg-").replace("400", "500/30");
                const barFg = agentColor.replace("text-", "bg-");

                return (
                  <div key={agent.name} className="flex items-center gap-4">
                    <span
                      className={`text-xs font-medium w-24 text-right ${agentColor}`}
                    >
                      {agent.displayName}
                    </span>
                    <div className="flex-1">
                      <div className={`h-6 rounded-lg overflow-hidden ${barBg}`}>
                        <div
                          className={`h-full ${barFg} rounded-lg transition-all flex items-center justify-end px-2`}
                          style={{ width: `${Math.max(barWidth, 8)}%` }}
                        >
                          <span className="text-[10px] text-gray-900 font-bold">
                            {agent.sessions}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 w-20 text-right">
                      {agent.tasksCompleted}/{agent.tasks} tasks
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
