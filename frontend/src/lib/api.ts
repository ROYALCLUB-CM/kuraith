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
};
