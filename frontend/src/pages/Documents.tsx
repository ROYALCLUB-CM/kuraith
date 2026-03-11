import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";

const TYPES = ["", "note", "knowledge", "decision", "pattern", "bug", "session", "learning"];
const STAGES = ["", "raw", "refined", "gem"];

function stageBadge(stage: string) {
  const colors: Record<string, string> = {
    raw: "bg-gray-700 text-gray-300",
    refined: "bg-cyan-500/20 text-cyan-400",
    gem: "bg-amber-500/20 text-amber-400",
  };
  return colors[stage] || colors.raw;
}

function typeBadge(type: string) {
  const colors: Record<string, string> = {
    knowledge: "bg-green-500/20 text-green-400",
    decision: "bg-purple-500/20 text-purple-400",
    pattern: "bg-blue-500/20 text-blue-400",
    bug: "bg-red-500/20 text-red-400",
    note: "bg-gray-700 text-gray-300",
    session: "bg-orange-500/20 text-orange-400",
    learning: "bg-teal-500/20 text-teal-400",
  };
  return colors[type] || colors.note;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    api.documents({ page, type: typeFilter || undefined, stage: stageFilter || undefined }).then((r) => {
      setDocs(r.documents);
      setTotal(r.total);
    });
  }, [page, typeFilter, stageFilter]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Documents</h1>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300"
          >
            <option value="">All Types</option>
            {TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={stageFilter}
            onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300"
          >
            <option value="">All Stages</option>
            {STAGES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs">
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium w-24">Type</th>
              <th className="text-left px-4 py-3 font-medium w-24">Stage</th>
              <th className="text-left px-4 py-3 font-medium w-32">Concepts</th>
              <th className="text-left px-4 py-3 font-medium w-36">Created</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr
                key={doc.id}
                onClick={() => setSelected(selected?.id === doc.id ? null : doc)}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-600 shrink-0" />
                    <span className="text-gray-200 truncate">{doc.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${typeBadge(doc.type)}`}>
                    {doc.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${stageBadge(doc.stage)}`}>
                    {doc.stage || "raw"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {(doc.concepts || []).slice(0, 3).map((c: string) => (
                      <span key={c} className="text-xs text-gray-500">#{c}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {docs.length === 0 && (
          <p className="text-center text-gray-500 py-8 text-sm">No documents found</p>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-200">{selected.title}</h3>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 rounded text-xs ${typeBadge(selected.type)}`}>{selected.type}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${stageBadge(selected.stage)}`}>{selected.stage || "raw"}</span>
            </div>
          </div>
          <pre className="text-sm text-gray-400 whitespace-pre-wrap bg-gray-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {selected.content}
          </pre>
          <div className="flex gap-2 mt-3 text-xs text-gray-500">
            <span>ID: {selected.id}</span>
            {selected.project && <span>Project: {selected.project}</span>}
            <span>Concepts: {(selected.concepts || []).join(", ") || "none"}</span>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
