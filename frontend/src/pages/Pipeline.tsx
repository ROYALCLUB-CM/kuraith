import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ArrowRight, Gem, Filter, FileText } from "lucide-react";

function StageColumn({
  stage,
  docs,
  color,
  icon: Icon,
}: {
  stage: string;
  docs: any[];
  color: string;
  icon: any;
}) {
  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className={`flex items-center gap-2 mb-3 px-1`}>
        <Icon size={16} className={color} />
        <span className={`text-sm font-semibold ${color}`}>
          {stage.charAt(0).toUpperCase() + stage.slice(1)}
        </span>
        <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
          {docs.length}
        </span>
      </div>
      {/* Cards */}
      <div className="space-y-2">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors"
          >
            <p className="text-sm text-gray-200 font-medium truncate">{doc.title}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {doc.content?.substring(0, 100)}
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {(doc.concepts || []).slice(0, 3).map((c: string) => (
                <span
                  key={c}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-600">{doc.type}</span>
              <span className="text-[10px] text-gray-600">
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {docs.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs">Empty</div>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [raw, setRaw] = useState<any[]>([]);
  const [refined, setRefined] = useState<any[]>([]);
  const [gem, setGem] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.documents({ stage: "raw" }),
      api.documents({ stage: "refined" }),
      api.documents({ stage: "gem" }),
    ]).then(([r, f, g]) => {
      setRaw(r.documents);
      setRefined(f.documents);
      setGem(g.documents);
    });
  }, []);

  const total = raw.length + refined.length + gem.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">Knowledge Pipeline</h1>
        <p className="text-sm text-gray-500">
          {total} documents across 3 stages
        </p>
      </div>

      {/* Flow indicator */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-500" /> Raw
        </span>
        <ArrowRight size={14} className="text-gray-700" />
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-500" /> Refined
        </span>
        <ArrowRight size={14} className="text-gray-700" />
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Gem
        </span>
      </div>

      {/* 3 Columns */}
      <div className="flex gap-4">
        <StageColumn stage="raw" docs={raw} color="text-gray-400" icon={FileText} />
        <StageColumn stage="refined" docs={refined} color="text-cyan-400" icon={Filter} />
        <StageColumn stage="gem" docs={gem} color="text-amber-400" icon={Gem} />
      </div>
    </div>
  );
}
