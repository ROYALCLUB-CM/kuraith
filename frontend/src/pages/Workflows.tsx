import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Workflow, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

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

const statusBg: Record<string, string> = {
  pending: "bg-gray-500/10",
  in_progress: "bg-cyan-500/10",
  completed: "bg-green-500/10",
  failed: "bg-red-500/10",
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    api.workflows().then((r) => setWorkflows(r.workflows || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">Workflows</h1>
        <p className="text-sm text-gray-500">Multi-agent task orchestration</p>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Workflow size={32} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">No workflows yet</p>
          <p className="text-gray-600 text-xs mt-1">
            Use kuraith_workflow to create one via MCP
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {workflows.map((w: any) => {
            const tasks = w.tasks || [];
            const done = tasks.filter((t: any) => t.status === "completed").length;
            const Icon = statusIcon[w.status] || Circle;
            const isSelected = selected?.id === w.id;

            return (
              <div key={w.id}>
                <div
                  onClick={() => setSelected(isSelected ? null : w)}
                  className={`bg-gray-900 border rounded-xl p-5 cursor-pointer transition-colors ${
                    isSelected ? "border-cyan-500/50" : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusBg[w.status]}`}>
                        <Icon size={18} className={statusColor[w.status]} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-200">{w.name}</h3>
                        {w.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{w.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${statusColor[w.status]}`}>
                        {w.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {done}/{tasks.length} tasks
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all"
                      style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Tasks detail */}
                {isSelected && tasks.length > 0 && (
                  <div className="mt-2 bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-2">
                    {tasks.map((t: any) => {
                      const TIcon = statusIcon[t.status] || Circle;
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <TIcon size={14} className={statusColor[t.status]} />
                            <span className="text-sm text-gray-300">{t.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-500">
                              {t.agentDisplay || t.agent}
                            </span>
                            {t.branch && (
                              <span className="text-cyan-500/70 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                                {t.branch}
                              </span>
                            )}
                            <span className={statusColor[t.status]}>{t.status}</span>
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
  );
}
