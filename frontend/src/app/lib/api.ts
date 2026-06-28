import { API_BASE_URL } from "./config";

export type BackendUser = {
  id: string;
  email: string;
  name: string;
  google_sub: string | null;
  created_at: string;
};

export type BackendTask = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  source: string;
  priority: number;
  estimated_minutes: number;
  progress: number;
  risk_score: number;
  completion_probability: number;
  deadline_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BackendDashboard = {
  threat_level: string;
  completion_percent: number;
  burnout_indicator: string;
  current_focus: BackendTask | null;
  upcoming_deadlines: BackendTask[];
  recommendations: string[];
};

export type BackendToolCall = {
  name: string;
  arguments: Record<string, unknown>;
  status: string;
  result: Record<string, unknown> | null;
};

export type BackendAgentResponse = {
  message: string;
  tool_calls: BackendToolCall[];
  recommendations: string[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Backend request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function query(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  return search.toString();
}

export const api = {
  health: () => request<{ status: string; service: string }>("/health"),

  createDemoUser: () =>
    request<BackendUser>("/api/users", {
      method: "POST",
      body: JSON.stringify({
        email: "alex.demo@example.com",
        name: "Alex",
      }),
    }),

  getDashboard: (userId: string) =>
    request<BackendDashboard>(`/api/dashboard?${query({ user_id: userId })}`),

  getTasks: (userId: string) => request<BackendTask[]>(`/api/tasks?${query({ user_id: userId })}`),

  createTask: (userId: string, title: string) =>
    request<BackendTask>(`/api/tasks?${query({ user_id: userId })}`, {
      method: "POST",
      body: JSON.stringify({
        title,
        description: "Created from the frontend.",
        priority: 3,
        estimated_minutes: 30,
        deadline_at: null,
      }),
    }),

  chat: (userId: string, message: string) =>
    request<BackendAgentResponse>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, message, context: {} }),
    }),

  panic: (userId: string, taskTitle: string) =>
    request<BackendAgentResponse>(
      `/api/ai/panic?${query({ user_id: userId, task_title: taskTitle })}`,
      { method: "POST" },
    ),

  focus: (userId: string, taskTitle: string, minutes = 25) =>
    request<BackendAgentResponse>(
      `/api/ai/focus?${query({ user_id: userId, task_title: taskTitle, minutes })}`,
      { method: "POST" },
    ),
};
