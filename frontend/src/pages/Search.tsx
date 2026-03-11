import { useState } from "react";
import { api } from "../lib/api";
import { Search as SearchIcon, FileText } from "lucide-react";

function stageBadge(stage: string) {
  const colors: Record<string, string> = {
    raw: "bg-gray-700 text-gray-300",
    refined: "bg-cyan-500/20 text-cyan-400",
    gem: "bg-amber-500/20 text-amber-400",
  };
  return colors[stage] || colors.raw;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await api.search(query);
      setResults(r.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">Search</h1>
        <p className="text-sm text-gray-500">Search across all knowledge</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge, patterns, decisions..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-colors"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <SearchIcon size={32} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm">No results for "{query}"</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">{results.length} results</p>
              {results.map((r: any) => (
                <div
                  key={r.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <FileText size={16} className="text-gray-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-gray-200">
                          {r.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {r.content?.substring(0, 200)}
                        </p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {(r.concepts || []).map((c: string) => (
                            <span
                              key={c}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400"
                            >
                              #{c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                        {r.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${stageBadge(r.stage)}`}>
                        {r.stage || "raw"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
