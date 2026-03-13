import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken, connectSSE, onEvent } from "../lib/api";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Workflow,
  Clock,
  Search,
  Radio,
  Building2,
  LogOut,
} from "lucide-react";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/office", icon: Building2, label: "Office" },
  { to: "/mission-control", icon: Radio, label: "Mission Control" },
  { to: "/documents", icon: FileText, label: "Documents" },
  { to: "/pipeline", icon: GitBranch, label: "Pipeline" },
  { to: "/workflows", icon: Workflow, label: "Workflows" },
  { to: "/sessions", icon: Clock, label: "Sessions" },
  { to: "/search", icon: Search, label: "Search" },
];

export default function Layout() {
  const navigate = useNavigate();
  const [liveIndicator, setLiveIndicator] = useState(false);

  useEffect(() => {
    connectSSE();
    const unsub = onEvent("*", () => {
      setLiveIndicator(true);
      setTimeout(() => setLiveIndicator(false), 2000);
    });
    return unsub;
  }, []);

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-widest text-cyan-400">
              KURAITH
            </h1>
            <span className={`w-2 h-2 rounded-full transition-colors ${liveIndicator ? "bg-cyan-400 animate-pulse" : "bg-green-500"}`} />
          </div>
          <p className="text-[10px] text-gray-500 tracking-wider mt-0.5">
            เงาที่ไม่เคยลืม
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-500 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
        <Outlet />
      </main>
    </div>
  );
}
