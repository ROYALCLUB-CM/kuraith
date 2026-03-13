const BASE = "/api";

let token: string | null = localStorage.getItem("kuraith_token");

export function setToken(t: string) {
  token = t;
  localStorage.setItem("kuraith_token", t);
}

export function clearToken() {
  token = null;
  localStorage.removeItem("kuraith_token");
}

export function getToken() {
  return token;
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, name: string, password: string) =>
    request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    }),

  // Dashboard
  dashboardStats: () => request<any>("/dashboard/stats"),
  dashboardTypes: () => request<any>("/dashboard/documents/types"),
  dashboardActivity: (days = 7) => request<any>(`/dashboard/activity?days=${days}`),
  dashboardSearches: () => request<any>("/dashboard/searches"),
  dashboardLearnings: () => request<any>("/dashboard/learnings"),

  // Documents
  documents: (params?: { page?: number; type?: string; stage?: string; project?: string }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set("page", String(params.page));
    if (params?.type) sp.set("type", params.type);
    if (params?.stage) sp.set("stage", params.stage);
    if (params?.project) sp.set("project", params.project);
    return request<any>(`/documents?${sp}`);
  },

  document: (id: string) => request<any>(`/documents/${id}`),

  // Search
  search: (q: string, limit = 20) => request<any>(`/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  // Sessions
  sessions: () => request<any>("/sessions"),

  // Workflows
  workflows: () => request<any>("/workflows"),
  workflow: (id: string) => request<any>(`/workflows/${id}`),

  // Mission Control
  missionControl: () => request<any>("/mission-control"),
};

// ─── SSE Real-time Events ───

type EventCallback = (data: any) => void;
const listeners: Record<string, Set<EventCallback>> = {};
let eventSource: EventSource | null = null;

export function connectSSE() {
  if (eventSource) return;
  eventSource = new EventSource(`${BASE}/events`);

  const eventTypes = ["learn", "handoff", "workflow", "search", "refine", "heartbeat"];
  for (const type of eventTypes) {
    eventSource.addEventListener(type, (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const cbs = listeners[type];
      if (cbs) cbs.forEach((cb) => cb(data));
      // Also notify "any" listeners
      const anyCbs = listeners["*"];
      if (anyCbs) anyCbs.forEach((cb) => cb({ event: type, ...data }));
    });
  }

  eventSource.onerror = () => {
    eventSource?.close();
    eventSource = null;
    // Reconnect after 5s
    setTimeout(connectSSE, 5000);
  };
}

export function onEvent(event: string, cb: EventCallback): () => void {
  if (!listeners[event]) listeners[event] = new Set();
  listeners[event].add(cb);
  return () => listeners[event]?.delete(cb);
}

export function disconnectSSE() {
  eventSource?.close();
  eventSource = null;
}
