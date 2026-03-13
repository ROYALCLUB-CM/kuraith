import { useEffect, useState, useCallback } from "react";
import { api, onEvent } from "../lib/api";
import {
  FileText,
  Clock,
  BookOpen,
  Search,
  Gem,
  Filter,
  Sparkles,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-100">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function PipelineBar({ raw, refined, gem }: { raw: number; refined: number; gem: number }) {
  const total = raw + refined + gem || 1;
  const rp = (raw / total) * 100;
  const fp = (refined / total) * 100;
  const gp = (gem / total) * 100;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Knowledge Pipeline</h3>
      {/* Bar */}
      <div className="flex h-4 rounded-full overflow-hidden bg-gray-800">
        {rp > 0 && (
          <div className="bg-gray-500 transition-all" style={{ width: `${rp}%` }} />
        )}
        {fp > 0 && (
          <div className="bg-cyan-500 transition-all" style={{ width: `${fp}%` }} />
        )}
        {gp > 0 && (
          <div className="bg-amber-400 transition-all" style={{ width: `${gp}%` }} />
        )}
      </div>
      {/* Legend */}
      <div className="flex gap-6 mt-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
          <span className="text-gray-400">Raw {raw}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span className="text-gray-400">Refined {refined}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-gray-400">Gem {gem}</span>
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  const refresh = useCallback(() => {
    api.dashboardStats().then(setStats);
    api.dashboardActivity(7).then((r) => setActivity(r.activity || []));
  }, []);

  useEffect(() => {
    refresh();
    return onEvent("*", refresh);
  }, [refresh]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading...
      </div>
    );
  }

  const pipeline = stats.pipeline || { raw: 0, refined: 0, gem: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500">KURAITH overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={FileText} label="Documents" value={stats.documents} color="bg-cyan-500/10 text-cyan-400" />
        <StatCard icon={Clock} label="Sessions" value={stats.sessions} color="bg-purple-500/10 text-purple-400" />
        <StatCard icon={BookOpen} label="Learnings" value={stats.learnings} color="bg-green-500/10 text-green-400" />
        <StatCard icon={Search} label="Searches" value={stats.searches} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={Gem} label="Gems" value={pipeline.gem || 0} color="bg-amber-500/10 text-amber-400" />
        <StatCard icon={Filter} label="Refined" value={pipeline.refined || 0} color="bg-teal-500/10 text-teal-400" />
      </div>

      {/* Pipeline */}
      <PipelineBar raw={pipeline.raw} refined={pipeline.refined} gem={pipeline.gem} />

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Recent Activity</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-gray-500">No activity yet</p>
        ) : (
          <div className="space-y-2">
            {activity.slice(0, 15).map((a: any) => (
              <div
                key={a.id}
                className="flex items-center justify-between text-sm py-1.5 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-cyan-500" />
                  <span className="text-gray-300">{a.action}</span>
                  {a.details && (
                    <span className="text-gray-500 truncate max-w-md">
                      — {a.details}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-600 shrink-0">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
