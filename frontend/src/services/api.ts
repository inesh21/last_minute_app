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

export type CalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
};

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("auth_session");
      window.location.replace("/");
      throw new Error("Session expired. Please sign in again.");
    }
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
  health: () => request<{ status: string; service: string }>('/health'),

  getMe: () => request<BackendUser>('/api/users/me'),

  getDashboard: () => request<BackendDashboard>('/api/dashboard'),

  getTasks: () => request<BackendTask[]>('/api/tasks'),

  createTask: (title: string, description = '', priority = 3, estimatedMinutes = 30, deadlineAt: string | null = null) =>
    request<BackendTask>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        priority,
        estimated_minutes: estimatedMinutes,
        deadline_at: deadlineAt,
      }),
    }),

  updateTask: (taskId: string, updates: Record<string, unknown>) =>
    request<BackendTask>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteTask: (taskId: string) =>
    request<{ status: string; id: string }>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  chat: (message: string) =>
    request<BackendAgentResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ user_id: '', message, context: {} }),
    }),

  panic: (taskTitle: string) =>
    request<BackendAgentResponse>(`/api/ai/panic?${query({ task_title: taskTitle })}`, {
      method: 'POST',
    }),

  focus: (taskTitle: string, minutes = 25) =>
    request<BackendAgentResponse>(
      `/api/ai/focus?${query({ task_title: taskTitle, minutes })}`,
      { method: 'POST' },
    ),

  oneClickStarter: (title: string, output: 'doc' | 'slides' = 'doc') =>
    request<Record<string, unknown>>(
      `/api/ai/one-click-starter?${query({ title, output })}`,
      { method: 'POST' },
    ),

  getCalendarEvents: (days = 7) =>
    request<{ events: CalendarEvent[]; count: number }>(
      `/api/calendar/events?${query({ days })}`,
    ),

  screenerRun: (gmailQuery = 'newer_than:7d') =>
    request<BackendAgentResponse>('/api/ai/screener/run', {
      method: 'POST',
      body: JSON.stringify({ user_id: '', gmail_query: gmailQuery }),
    }),

  getGoogleAuthUrl: () =>
    request<{ url: string; state: string }>('/api/auth/google/url'),
};
