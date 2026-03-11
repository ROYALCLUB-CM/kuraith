import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Clock, ArrowRightLeft, Bot } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    api.sessions().then((r) => setSessions(r.sessions || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">Sessions</h1>
        <p className="text-sm text-gray-500">Work session history</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Clock size={32} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">No sessions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => {
            const duration = s.endedAt
              ? Math.round(
                  (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000
                )
              : null;

            return (
              <div
                key={s.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Bot size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-200">
                          {s.agent}
                        </span>
                        {s.project && (
                          <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                            {s.project}
                          </span>
                        )}
                      </div>
                      {s.summary && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {s.summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        s.endedAt
                          ? "bg-gray-700 text-gray-400"
                          : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {s.endedAt ? "ended" : "active"}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(s.startedAt).toLocaleString()}
                    </p>
                    {duration !== null && (
                      <p className="text-xs text-gray-600">{duration}m</p>
                    )}
                  </div>
                </div>

                {/* Discoveries */}
                {s.discoveries && s.discoveries.length > 0 && (
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {s.discoveries.map((d: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {/* Handoffs */}
                {s.handoffs && s.handoffs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <ArrowRightLeft size={10} />
                      <span>{s.handoffs.length} handoff(s)</span>
                    </div>
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
