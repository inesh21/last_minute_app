import type { BackendTask } from "../services/api";

export type ThreatLevel = "safe" | "busy" | "high-risk" | "critical" | "impossible";

export type AppTask = {
  title: string;
  deadline: string;
  priority: "rose" | "orange" | "amber" | "green";
  priorityLabel: string;
  effort: string;
  completion: number;
  prediction: number;
  risk: number;
  subtasks: string[];
  deps: string[];
};

export const threatConfig: Record<ThreatLevel, { label: string; color: string; bg: string; dot: string }> = {
  safe:       { label: "Safe",       color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", dot: "bg-emerald-500" },
  busy:       { label: "Busy",       color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/40",    dot: "bg-amber-400"  },
  "high-risk":{ label: "High Risk",  color: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-950/40",  dot: "bg-orange-500" },
  critical:   { label: "Critical",   color: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-950/40",      dot: "bg-rose-500"   },
  impossible: { label: "Impossible", color: "text-foreground",                        bg: "bg-foreground/10",                    dot: "bg-foreground" },
};

export function normalizeThreat(threat?: string): ThreatLevel {
  const normalized = threat?.replace("_", "-") as ThreatLevel | undefined;
  return normalized && normalized in threatConfig ? normalized : "safe";
}

export function formatDeadline(value: string | null) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function toPercent(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

export function priorityMeta(priority: number, risk: number): Pick<AppTask, "priority" | "priorityLabel"> {
  if (risk >= 70 || priority >= 5) return { priority: "rose", priorityLabel: "Critical" };
  if (risk >= 40 || priority === 4) return { priority: "orange", priorityLabel: "High" };
  if (risk >= 20 || priority === 3) return { priority: "amber", priorityLabel: "Medium" };
  return { priority: "green", priorityLabel: "Low" };
}

export function taskFromBackend(task: BackendTask): AppTask {
  const risk = toPercent(task.risk_score);
  return {
    title: task.title,
    deadline: formatDeadline(task.deadline_at),
    ...priorityMeta(task.priority, risk),
    effort: task.estimated_minutes >= 60 ? `${Math.round(task.estimated_minutes / 60)}h` : `${task.estimated_minutes}m`,
    completion: toPercent(task.progress),
    prediction: toPercent(task.completion_probability),
    risk,
    subtasks: ["Clarify next step", "Work one focused block", "Update progress"],
    deps: task.source === "manual" ? [] : [task.source],
  };
}

export const navItems = [
  { id: "dashboard",  path: "/",           label: "Dashboard",      icon: "LayoutDashboard" },
  { id: "ai-command", path: "/ai-command", label: "AI Command",     icon: "MessageSquare"   },
  { id: "calendar",   path: "/calendar",   label: "Calendar",       icon: "Calendar"        },
  { id: "tasks",      path: "/tasks",      label: "Tasks",          icon: "CheckSquare"     },
  { id: "deadlines",  path: "/deadlines",  label: "Deadline Center",icon: "AlertTriangle"   },
  { id: "panic",      path: "/panic",      label: "Panic Mode",     icon: "Zap"             },
  { id: "focus",      path: "/focus",      label: "Focus Mode",     icon: "Focus"           },
  { id: "workspace",  path: "/workspace",  label: "AI Workspace",   icon: "FolderOpen"      },
  { id: "analytics",  path: "/analytics",  label: "Analytics",      icon: "BarChart2"       },
] as const;
