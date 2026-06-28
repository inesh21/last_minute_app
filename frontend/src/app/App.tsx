import { useCallback, useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, MessageSquare, Calendar, CheckSquare,
  AlertTriangle, Zap, Focus, FolderOpen, BarChart2,
  Moon, Sun, Bell, LogOut, ChevronRight, Clock,
  Shield, Brain, Send, X, Check, Timer,
  Target, Flame, Activity, FileText, Mail,
  Play, Pause, SkipForward, RefreshCw, Plus,
  TrendingUp, TrendingDown, Eye, EyeOff, Star,
  ChevronLeft, ChevronDown, MoreHorizontal, Inbox,
  BookOpen, Layers, Coffee, Cpu, BellOff
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { api, type BackendDashboard, type BackendTask, type BackendUser } from "../services/api";

// ── Types ──────────────────────────────────────────────────────────────────

type Screen =
  | "login"
  | "dashboard"
  | "ai-command"
  | "calendar"
  | "tasks"
  | "deadlines"
  | "panic"
  | "focus"
  | "workspace"
  | "analytics";

type ThreatLevel = "safe" | "busy" | "high-risk" | "critical" | "impossible";

type AppTask = {
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

function normalizeThreat(threat?: string): ThreatLevel {
  const normalized = threat?.replace("_", "-") as ThreatLevel | undefined;
  return normalized && normalized in threatConfig ? normalized : "safe";
}

function formatDeadline(value: string | null) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function toPercent(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

function priorityMeta(priority: number, risk: number): Pick<AppTask, "priority" | "priorityLabel"> {
  if (risk >= 70 || priority >= 5) return { priority: "rose", priorityLabel: "Critical" };
  if (risk >= 40 || priority === 4) return { priority: "orange", priorityLabel: "High" };
  if (risk >= 20 || priority === 3) return { priority: "amber", priorityLabel: "Medium" };
  return { priority: "green", priorityLabel: "Low" };
}

function taskFromBackend(task: BackendTask): AppTask {
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

// ── Data ──────────────────────────────────────────────────────────────────

const threatConfig: Record<ThreatLevel, { label: string; color: string; bg: string; dot: string }> = {
  safe:       { label: "Safe",       color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", dot: "bg-emerald-500" },
  busy:       { label: "Busy",       color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/40",    dot: "bg-amber-400"  },
  "high-risk":{ label: "High Risk",  color: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-950/40",  dot: "bg-orange-500" },
  critical:   { label: "Critical",   color: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-950/40",      dot: "bg-rose-500"   },
  impossible: { label: "Impossible", color: "text-foreground",                        bg: "bg-foreground/10",                    dot: "bg-foreground" },
};

const navItems = [
  { id: "dashboard",  label: "Dashboard",         icon: LayoutDashboard },
  { id: "ai-command", label: "AI Command",         icon: MessageSquare   },
  { id: "calendar",   label: "Calendar",           icon: Calendar        },
  { id: "tasks",      label: "Tasks",              icon: CheckSquare     },
  { id: "deadlines",  label: "Deadline Center",    icon: AlertTriangle   },
  { id: "panic",      label: "Panic Mode",         icon: Zap             },
  { id: "focus",      label: "Focus Mode",         icon: Focus           },
  { id: "workspace",  label: "AI Workspace",       icon: FolderOpen      },
  { id: "analytics",  label: "Analytics",          icon: BarChart2       },
];

const analyticsWeekly = [
  { day: "Mon", tasks: 7, focus: 3.2, score: 82 },
  { day: "Tue", tasks: 5, focus: 2.8, score: 71 },
  { day: "Wed", tasks: 9, focus: 4.5, score: 91 },
  { day: "Thu", tasks: 4, focus: 1.9, score: 60 },
  { day: "Fri", tasks: 11, focus: 5.1, score: 94 },
  { day: "Sat", tasks: 3, focus: 1.2, score: 55 },
  { day: "Sun", tasks: 6, focus: 2.7, score: 73 },
];

const deadlinePie = [
  { name: "On Track", value: 5, color: "#8EC9BE" },
  { name: "At Risk",  value: 3, color: "#F2C98C" },
  { name: "Critical", value: 2, color: "#E04F6B" },
];

// ── Shared Components ─────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "green" | "amber" | "orange" | "rose" | "blue" | "purple" }) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    green:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    amber:   "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    orange:  "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    rose:    "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    blue:    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    purple:  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-[family-name:var(--font-mono,'DM_Mono')] ${variants[variant]}`}>
      {children}
    </span>
  );
}

function ProgressBar({ value, color = "bg-primary", className = "" }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-1.5 w-full bg-muted rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Btn({
  children, onClick, variant = "primary", className = "", disabled = false
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger"; className?: string; disabled?: boolean;
}) {
  const variants = {
    primary:   "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-accent border border-border",
    ghost:     "text-muted-foreground hover:bg-muted hover:text-foreground",
    danger:    "bg-rose-500 text-white hover:bg-rose-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ── Screen: Login ─────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Zap size={18} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold font-[Plus_Jakarta_Sans] text-foreground tracking-tight">Last Minute Lifesaver</span>
          </div>
          <p className="text-muted-foreground text-sm">Your AI Chief of Staff — always one step ahead.</p>
        </div>

        <Card className="p-8 shadow-sm">
          <h2 className="text-center mb-1">Welcome back</h2>
          <p className="text-center text-muted-foreground text-sm mb-8">Sign in to continue to your workspace</p>

          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 border border-border rounded-lg py-2.5 px-4 hover:bg-muted transition-colors text-sm font-medium cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Permissions requested</p>
            <div className="grid grid-cols-2 gap-2">
              {["Google Calendar", "Gmail", "Google Tasks", "Google Drive", "Google Docs", "Google Maps"].map(p => (
                <div key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check size={11} className="text-primary flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

// ── Screen: Dashboard ─────────────────────────────────────────────────────

function DashboardScreen({
  onNavigate,
  dashboard,
  tasks: backendTasks,
  backendStatus,
}: {
  onNavigate: (s: Screen) => void;
  dashboard: BackendDashboard | null;
  tasks: BackendTask[];
  backendStatus: "connecting" | "connected" | "offline";
}) {
  const threat: ThreatLevel = normalizeThreat(dashboard?.threat_level) || "high-risk";
  const tc = threatConfig[threat];

  const fallbackTasks = [
    { title: "Finalize research paper draft", deadline: "Today 11:59 PM", priority: "rose", completion: 34, risk: 87 },
    { title: "Prepare client presentation slides", deadline: "Tomorrow 9:00 AM", priority: "orange", completion: 62, risk: 54 },
    { title: "Review sprint backlog items", deadline: "Wed 3:00 PM", priority: "amber", completion: 80, risk: 21 },
    { title: "Submit expense reports", deadline: "Fri 5:00 PM", priority: "green", completion: 90, risk: 8 },
  ];
  const tasks = backendTasks.length > 0
    ? backendTasks.slice(0, 4).map(taskFromBackend)
    : fallbackTasks.map(task => ({ ...task, prediction: 100 - task.risk }));

  const fallbackRecs = [
    { icon: Brain,  text: "Start paper intro section now — 90 min estimated", action: "Start Focus" },
    { icon: Mail,   text: "Draft extension email for research paper deadline",  action: "Generate" },
    { icon: Coffee, text: "Schedule 20-min break at 3 PM to prevent burnout",  action: "Schedule" },
  ];
  const recs = dashboard?.recommendations?.length
    ? dashboard.recommendations.map((text, index) => ({
        icon: index === 0 ? Brain : index === 1 ? Mail : Coffee,
        text,
        action: index === 0 ? "Start Focus" : "Review",
      }))
    : fallbackRecs;
  const completionPercent = Math.round(dashboard?.completion_percent ?? 58);
  const completedTasks = backendTasks.filter(task => task.status === "done").length;
  const deadlineTasks = dashboard?.upcoming_deadlines?.length
    ? dashboard.upcoming_deadlines.map(taskFromBackend)
    : tasks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Good morning, Alex</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Monday, 30 June 2025 · 08:42 AM</p>
        </div>
        <Btn variant="secondary" onClick={() => onNavigate("panic")}>
          <Zap size={14} /> Panic Mode
        </Btn>
      </div>

      {/* Top metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Threat level */}
        <Card className={`col-span-2 lg:col-span-1 ${tc.bg}`}>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Threat Level</p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${tc.dot} animate-pulse`} />
            <span className={`text-lg font-semibold ${tc.color}`}>{tc.label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{deadlineTasks.length} deadlines tracked</p>
        </Card>

        <Card>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Completion</p>
          <p className="text-2xl font-semibold text-foreground">{completionPercent}%</p>
          <ProgressBar value={completionPercent} />
          <p className="text-xs text-muted-foreground mt-1.5">
            {backendTasks.length ? `${completedTasks} of ${backendTasks.length} tasks done` : "Demo task data"}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Focus Hours</p>
          <p className="text-2xl font-semibold text-foreground">2.4h</p>
          <ProgressBar value={40} color="bg-violet-400" />
          <p className="text-xs text-muted-foreground mt-1.5">Target: 6h today</p>
        </Card>

        <Card>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Burnout Risk</p>
          <p className="text-2xl font-semibold text-amber-500">Moderate</p>
          <ProgressBar value={55} color="bg-amber-400" />
          <p className="text-xs text-muted-foreground mt-1.5">Take a break by 3 PM</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's tasks */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3>Today's Tasks</h3>
            <button onClick={() => onNavigate("tasks")} className="text-xs text-primary hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></button>
          </div>
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  t.priority === "rose" ? "bg-rose-500" :
                  t.priority === "orange" ? "bg-orange-400" :
                  t.priority === "amber" ? "bg-amber-400" : "bg-emerald-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{t.title}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} /> {t.deadline}</span>
                    <span className="text-xs text-muted-foreground">{t.completion}% done</span>
                  </div>
                  <ProgressBar value={t.completion} className="mt-1.5" />
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-medium ${t.risk > 70 ? "text-rose-500" : t.risk > 40 ? "text-amber-500" : "text-emerald-500"}`}>
                    {t.risk}% risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} className="text-primary" />
            <h3>AI Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recs.map((r, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-background/60">
                <p className="text-xs text-foreground leading-relaxed">{r.text}</p>
                <button className="mt-2 text-xs text-primary hover:underline font-medium">{r.action} →</button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3>Upcoming Deadlines</h3>
          <button onClick={() => onNavigate("deadlines")} className="text-xs text-primary hover:underline flex items-center gap-1">Deadline Center <ChevronRight size={12} /></button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {deadlineTasks.map((d, i) => (
            <div key={i} className={`flex-shrink-0 w-44 p-3 rounded-lg border-l-2 bg-muted/40 ${
              d.priority === "rose" ? "border-rose-300 dark:border-rose-800" :
              d.priority === "orange" ? "border-orange-300 dark:border-orange-800" :
              d.priority === "amber" ? "border-amber-300 dark:border-amber-800" :
              "border-emerald-300 dark:border-emerald-800"
            }`}>
              <p className="text-xs font-medium leading-tight">{d.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{d.deadline}</p>
              <p className={`text-sm font-semibold mt-2 ${d.prediction < 40 ? "text-rose-500" : d.prediction < 70 ? "text-amber-500" : "text-emerald-500"}`}>
                {d.prediction}% chance
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Screen: AI Command Center ──────────────────────────────────────────────

function AICommandScreen({ userId }: { userId: string | null }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello Alex. I've reviewed your schedule and detected 2 high-risk deadlines today. How can I help you right now?" },
    { role: "user", text: "I can't finish my research paper by tonight." },
    { role: "assistant", text: "Understood. Based on your current progress (34%) and estimated writing speed, finishing is unlikely without intervention.\n\nI've prepared three actions:\n1. Drafted a 3-day extension email to your professor — ready to send\n2. Blocked 4 focus sessions (1h each) starting at 9 AM today\n3. Generated a detailed outline with 15-minute micro tasks\n\nShall I execute all three now?" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Move my 2 PM meeting",
    "Help me study for Thursday's exam",
    "I have only 90 minutes — what should I do?",
    "Create presentation slides for client",
    "Generate extension email for professor",
  ];

  const send = async () => {
    if (!input.trim()) return;
    const message = input;
    setMessages(m => [...m, { role: "user", text: message }]);
    setInput("");
    if (!userId) {
      setMessages(m => [...m, { role: "assistant", text: "Sign in first so I can connect this request to your backend workspace." }]);
      return;
    }

    try {
      const response = await api.chat(userId, message);
      const toolSummary = response.tool_calls.length
        ? `\n\nTools: ${response.tool_calls.map(tool => `${tool.name} (${tool.status})`).join(", ")}`
        : "";
      const recommendations = response.recommendations.length
        ? `\n\nNext:\n${response.recommendations.map(item => `- ${item}`).join("\n")}`
        : "";
      setMessages(m => [...m, { role: "assistant", text: `${response.message}${toolSummary}${recommendations}` }]);
    } catch (error) {
      setMessages(m => [...m, { role: "assistant", text: `Backend request failed: ${error instanceof Error ? error.message : "Unknown error"}` }]);
    }
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-h-[800px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain size={18} className="text-primary" />
        </div>
        <div>
          <h2>AI Command Center</h2>
          <p className="text-xs text-muted-foreground">Powered by Gemini 2.5 Flash · Function calling enabled</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Active</span>
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Brain size={13} className="text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="flex-shrink-0 text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-accent transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2 p-4 border-t border-border">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Tell the AI what you need help with..."
            className="flex-1 bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50 transition-colors"
          />
          <button
            onClick={send}
            className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Send size={14} className="text-primary-foreground" />
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Screen: Calendar ──────────────────────────────────────────────────────

function CalendarScreen() {
  const [view, setView] = useState<"week" | "month">("week");
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const days = ["Mon 30", "Tue 1", "Wed 2", "Thu 3", "Fri 4"];

  const events: Record<string, { title: string; type: string; span: number; color: string }[]> = {
    "Mon 30": [
      { title: "Team Standup", type: "meeting", span: 1, color: "bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200" },
      { title: "Research Paper [Focus]", type: "focus", span: 2, color: "bg-violet-200 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200" },
      { title: "Lunch Break", type: "buffer", span: 1, color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" },
      { title: "Client Call", type: "meeting", span: 1, color: "bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200" },
    ],
    "Tue 1": [
      { title: "Write Paper Draft", type: "micro", span: 1, color: "bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200" },
      { title: "Client Presentation", type: "deadline", span: 1, color: "bg-rose-200 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200" },
    ],
  };

  const aiSuggestions = [
    { text: "Move Client Call to Wed 2 PM to create a 3h focus block for your research paper" },
    { text: "Add 30-min travel buffer before the 9 AM meeting (traffic detected on your route)" },
    { text: "Insert micro-task: 'Add citations' at 7:30 PM tonight (15 min)" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Calendar</h2>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            {(["week", "month"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs capitalize transition-colors cursor-pointer ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{v}</button>
            ))}
          </div>
          <Btn variant="secondary"><ChevronLeft size={13} /></Btn>
          <span className="text-sm font-medium">June 2025</span>
          <Btn variant="secondary"><ChevronRight size={13} /></Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Week grid */}
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          <div className="grid grid-cols-6 border-b border-border">
            <div className="p-3 text-xs text-muted-foreground" />
            {days.map(d => (
              <div key={d} className={`p-3 text-xs font-medium text-center border-l border-border ${d === "Mon 30" ? "bg-primary/5 text-primary" : "text-muted-foreground"}`}>{d}</div>
            ))}
          </div>
          <div className="overflow-y-auto max-h-96">
            {hours.map(h => (
              <div key={h} className="grid grid-cols-6 border-b border-border/50 min-h-[52px]">
                <div className="p-2 text-xs text-muted-foreground text-right pr-3 pt-2 font-[DM_Mono]">{h}:00</div>
                {days.map(d => {
                  const ev = events[d]?.find((_, i) => i === (h - 8) % (events[d]?.length || 1));
                  return (
                    <div key={d} className="border-l border-border/50 p-1">
                      {ev && h - 8 < (events[d]?.length || 0) && (
                        <div className={`text-xs rounded px-1.5 py-1 leading-tight ${ev.color}`}>
                          <div className="font-medium">{ev.title}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* AI suggestions panel */}
        <div className="space-y-3">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-primary" />
              <span className="text-sm font-medium">AI Suggestions</span>
            </div>
            <div className="space-y-2.5">
              {aiSuggestions.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/50 text-xs text-foreground leading-relaxed">{s.text}</div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Btn variant="primary" className="flex-1 justify-center text-xs"><Check size={12} /> Accept All</Btn>
              <Btn variant="secondary" className="flex-1 justify-center text-xs"><X size={12} /> Reject</Btn>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium mb-3">Legend</p>
            {[
              { color: "bg-blue-300 dark:bg-blue-700", label: "Meeting" },
              { color: "bg-violet-300 dark:bg-violet-700", label: "Focus Block" },
              { color: "bg-rose-300 dark:bg-rose-700", label: "Deadline" },
              { color: "bg-amber-300 dark:bg-amber-700", label: "Micro Task" },
              { color: "bg-green-300 dark:bg-green-700", label: "Buffer" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Tasks ─────────────────────────────────────────────────────────

function TasksScreen({ tasks: backendTasks }: { tasks: BackendTask[] }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  const fallbackTasks: AppTask[] = [
    {
      title: "Research Paper: AI in Healthcare",
      deadline: "30 Jun 11:59 PM",
      priority: "rose",
      priorityLabel: "Critical",
      effort: "8h",
      completion: 34,
      prediction: 27,
      risk: 87,
      subtasks: ["Read rubric (done)", "Find 5 sources", "Write introduction", "Write methodology", "Add citations", "Proofread"],
      deps: ["Library Access"],
    },
    {
      title: "Client Presentation Deck",
      deadline: "1 Jul 9:00 AM",
      priority: "orange",
      priorityLabel: "High",
      effort: "4h",
      completion: 62,
      prediction: 71,
      risk: 54,
      subtasks: ["Outline structure (done)", "Design slides 1–5 (done)", "Design slides 6–12", "Add data visualizations", "Rehearse narrative"],
      deps: ["Brand Assets", "Q2 Data"],
    },
    {
      title: "Sprint Backlog Review",
      deadline: "2 Jul 3:00 PM",
      priority: "amber",
      priorityLabel: "Medium",
      effort: "1.5h",
      completion: 80,
      prediction: 92,
      risk: 21,
      subtasks: ["Review tickets (done)", "Estimate story points (done)", "Flag blockers", "Update Jira"],
      deps: [],
    },
    {
      title: "Submit Monthly Expense Report",
      deadline: "4 Jul 5:00 PM",
      priority: "green",
      priorityLabel: "Low",
      effort: "45m",
      completion: 90,
      prediction: 98,
      risk: 8,
      subtasks: ["Collect receipts (done)", "Fill template (done)", "Manager approval"],
      deps: ["Finance Portal"],
    },
  ];
  const tasks = backendTasks.length > 0 ? backendTasks.map(taskFromBackend) : fallbackTasks;

  const priorityColors: Record<string, string> = {
    rose:   "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
    amber:  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    green:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Tasks</h2>
        <Btn variant="primary"><Plus size={14} /> New Task</Btn>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Today", "High Risk", "In Progress", "Blocked"].map((f, i) => (
          <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tasks.map((t, i) => (
          <Card key={i} className="p-0 overflow-hidden">
            <button
              className="w-full text-left p-4 hover:bg-muted/20 transition-colors cursor-pointer"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  t.priority === "rose" ? "bg-rose-500" :
                  t.priority === "orange" ? "bg-orange-400" :
                  t.priority === "amber" ? "bg-amber-400" : "bg-emerald-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{t.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${priorityColors[t.priority]}`}>{t.priorityLabel}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} /> {t.deadline}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Timer size={10} /> {t.effort}</span>
                    <span className={`text-xs font-medium ${t.risk > 70 ? "text-rose-500" : t.risk > 40 ? "text-amber-500" : "text-emerald-500"}`}>
                      {t.risk}% risk
                    </span>
                    <span className={`text-xs font-medium ${t.prediction < 40 ? "text-rose-500" : t.prediction < 70 ? "text-amber-500" : "text-emerald-500"}`}>
                      {t.prediction}% finish probability
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={t.completion} />
                    <span className="text-xs text-muted-foreground flex-shrink-0">{t.completion}%</span>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-muted-foreground flex-shrink-0 transition-transform ${expanded === i ? "rotate-180" : ""}`} />
              </div>
            </button>

            {expanded === i && (
              <div className="px-4 pb-4 pt-0 border-t border-border mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Subtasks</p>
                    <div className="space-y-1.5">
                      {t.subtasks.map((s, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs">
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${s.includes("done") ? "bg-primary border-primary" : "border-border"}`}>
                            {s.includes("done") && <Check size={9} className="text-primary-foreground" />}
                          </div>
                          <span className={s.includes("done") ? "line-through text-muted-foreground" : ""}>{s.replace(" (done)", "")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    {t.deps.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Dependencies</p>
                        {t.deps.map(d => <Badge key={d}>{d}</Badge>)}
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Btn variant="primary" className="text-xs"><Focus size={12} /> Start Focus</Btn>
                      <Btn variant="secondary" className="text-xs"><Brain size={12} /> AI Assist</Btn>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Deadline Center ───────────────────────────────────────────────

function DeadlineCenterScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const deadlines = [
    {
      title: "Research Paper: AI in Healthcare",
      due: "Today, 11:59 PM",
      timeLeft: "15h 17m",
      prob: 27,
      color: "rose",
      actions: ["Create detailed outline", "Cancel gym session", "Enable Focus Mode", "Draft extension email to professor"],
    },
    {
      title: "Client Presentation (Q3 Strategy)",
      due: "Tomorrow, 9:00 AM",
      timeLeft: "24h 17m",
      prob: 62,
      color: "orange",
      actions: ["Finish slides 6–12", "Add Q2 data charts", "Rehearse 3-minute pitch"],
    },
    {
      title: "Sprint Backlog Review",
      due: "Wednesday, 3:00 PM",
      timeLeft: "54h",
      prob: 88,
      color: "amber",
      actions: ["Flag 2 blocking tickets", "Update Jira estimates"],
    },
    {
      title: "Monthly Expense Report",
      due: "Friday, 5:00 PM",
      timeLeft: "80h",
      prob: 98,
      color: "green",
      actions: ["Submit for manager approval"],
    },
  ];

  const colorMap: Record<string, { badge: string; bar: string; ring: string }> = {
    rose:   { badge: "rose",   bar: "bg-rose-400",    ring: "border-rose-300 dark:border-rose-800"   },
    orange: { badge: "orange", bar: "bg-orange-400",  ring: "border-orange-300 dark:border-orange-800" },
    amber:  { badge: "amber",  bar: "bg-amber-400",   ring: "border-amber-300 dark:border-amber-800"  },
    green:  { badge: "green",  bar: "bg-emerald-400", ring: "border-green-300 dark:border-green-800"  },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Deadline Center</h2>
        <Badge variant="rose">2 Critical</Badge>
      </div>

      <div className="space-y-4">
        {deadlines.map((d, i) => {
          const c = colorMap[d.color];
          return (
            <Card key={i} className={`border-l-2 ${c.ring}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base">{d.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock size={12} /> {d.due}</span>
                    <span className="text-sm text-muted-foreground">{d.timeLeft} remaining</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-semibold ${d.prob < 40 ? "text-rose-500" : d.prob < 70 ? "text-amber-500" : "text-emerald-500"}`}>
                    {d.prob}%
                  </div>
                  <p className="text-xs text-muted-foreground">completion chance</p>
                </div>
              </div>

              <div className="mt-3">
                <ProgressBar value={d.prob} color={c.bar} />
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Suggested Actions</p>
                <div className="flex gap-2 flex-wrap">
                  {d.actions.map((a, j) => (
                    <button key={j} className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer flex items-center gap-1">
                      <ChevronRight size={10} /> {a}
                    </button>
                  ))}
                  {d.prob < 50 && (
                    <button onClick={() => onNavigate("panic")} className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 px-2.5 py-1.5 rounded-lg hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1 font-medium">
                      <Zap size={10} /> Activate Panic Mode
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Screen: Panic Mode ────────────────────────────────────────────────────

function PanicModeScreen({ onNavigate, userId }: { onNavigate: (s: Screen) => void; userId: string | null }) {
  const [active, setActive] = useState(false);
  const [checklist, setChecklist] = useState([
    { text: "Pause all non-essential notifications", done: false },
    { text: "Cancel gym session at 6 PM", done: false },
    { text: "Reschedule team lunch to Wednesday", done: false },
    { text: "Open research paper document", done: false },
    { text: "Start 90-minute focus timer", done: false },
    { text: "AI drafting paper outline (4 sections)", done: false },
  ]);

  const toggle = (i: number) => setChecklist(c => c.map((item, j) => j === i ? { ...item, done: !item.done } : item));
  const activatePanic = async () => {
    const nextActive = !active;
    setActive(nextActive);
    if (!nextActive || !userId) return;

    try {
      const response = await api.panic(userId, "Current highest-risk task");
      if (response.recommendations.length) {
        setChecklist(response.recommendations.map(text => ({ text, done: false })));
      }
    } catch {
      setChecklist(c => [
        ...c,
        { text: "Backend Panic Mode call failed - continue with local checklist", done: false },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-6 transition-all duration-500 ${active ? "bg-rose-500 text-white" : "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-white/20" : "bg-rose-100 dark:bg-rose-950/50"}`}>
              <Zap size={20} className={active ? "text-white" : "text-rose-500"} />
            </div>
            <div>
              <h2 className={active ? "text-white" : "text-rose-700 dark:text-rose-300"}>Panic Mode</h2>
              <p className={`text-sm ${active ? "text-white/80" : "text-rose-600/70 dark:text-rose-400"}`}>
                {active ? "Emergency optimization active — AI is working" : "Emergency mode for last-minute rescues"}
              </p>
            </div>
          </div>
          <button
            onClick={activatePanic}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              active ? "bg-white text-rose-600 hover:bg-white/90" : "bg-rose-500 text-white hover:bg-rose-600"
            }`}
          >
            {active ? "Deactivate" : "Activate Now"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Emergency actions */}
        <div className="lg:col-span-2 space-y-3">
          <h3>Emergency Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BellOff,   label: "Pause Notifications",   desc: "All alerts silenced"        },
              { icon: RefreshCw, label: "Reorder Schedule",      desc: "AI reoptimizes your day"    },
              { icon: X,         label: "Cancel Low-Priority",   desc: "3 tasks will be moved"      },
              { icon: Timer,     label: "Start 90min Timer",     desc: "Pomodoro focus session"     },
              { icon: FileText,  label: "Generate First Draft",  desc: "AI writes paper skeleton"   },
              { icon: FolderOpen,label: "Open Required Files",   desc: "Paper, notes, rubric"       },
            ].map((a, i) => (
              <button key={i} className={`p-3 rounded-xl border text-left transition-all cursor-pointer hover:border-primary/40 ${active ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900" : "bg-card border-border hover:bg-muted/50"}`}>
                <a.icon size={18} className={active ? "text-rose-500 mb-2" : "text-primary mb-2"} />
                <p className="text-sm font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={15} className="text-primary" />
            <h3>Panic Checklist</h3>
          </div>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                <button
                  onClick={() => toggle(i)}
                  className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${item.done ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}
                >
                  {item.done && <Check size={10} className="text-primary-foreground" />}
                </button>
                <span className={`text-xs leading-relaxed ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <ProgressBar value={(checklist.filter(c => c.done).length / checklist.length) * 100} color="bg-rose-400" />
            <p className="text-xs text-muted-foreground mt-1.5">{checklist.filter(c => c.done).length} of {checklist.length} completed</p>
          </div>
        </Card>
      </div>

      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-center gap-2 mb-2">
          <Mail size={15} className="text-amber-600" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Ghostwriter Ready</span>
        </div>
        <p className="text-xs text-muted-foreground">AI has drafted an extension request email for Professor Martinez. The email cites academic pressure and requests a 72-hour extension.</p>
        <div className="flex gap-2 mt-3">
          <Btn variant="secondary" className="text-xs"><Eye size={12} /> Preview Email</Btn>
          <Btn variant="primary" className="text-xs"><Send size={12} /> Send to Drafts</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Screen: Focus Mode ────────────────────────────────────────────────────

function FocusModeScreen({ userId }: { userId: string | null }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(5400); // 90 min
  const [backendNote, setBackendNote] = useState("");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = ((5400 - seconds) / 5400) * 100;
  const r = 80;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const toggleFocus = async () => {
    const nextRunning = !running;
    setRunning(nextRunning);
    if (!nextRunning || !userId) return;

    try {
      const response = await api.focus(userId, "Research Paper: AI in Healthcare", 90);
      setBackendNote(response.message);
    } catch {
      setBackendNote("Focus timer is running locally. Backend Focus Mode call failed.");
    }
  };

  const subtasks = [
    { text: "Write introduction (400 words)", done: true },
    { text: "Summarize source #1 and #2", done: true },
    { text: "Draft methodology section", done: false },
    { text: "Add in-text citations (APA)", done: false },
    { text: "Write conclusion paragraph", done: false },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      <div className="text-center">
        <Badge variant="purple">Focus Mode Active</Badge>
        <h2 className="mt-2">Research Paper: AI in Healthcare</h2>
        <p className="text-sm text-muted-foreground mt-1">Methodology Section · Section 3 of 5</p>
      </div>

      {/* Timer ring */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
            <circle
              cx="100" cy="100" r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold font-[DM_Mono] text-foreground">{fmt(seconds)}</span>
            <span className="text-xs text-muted-foreground mt-1">remaining</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Btn variant="secondary" onClick={() => setSeconds(5400)}><RefreshCw size={14} /> Reset</Btn>
        <button
          onClick={toggleFocus}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
        >
          {running ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
        <Btn variant="secondary"><SkipForward size={14} /> Skip</Btn>
      </div>

      {/* Progress & subtasks */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Session Progress</span>
          <span className="text-xs text-muted-foreground">{subtasks.filter(s => s.done).length} / {subtasks.length}</span>
        </div>
        <ProgressBar value={(subtasks.filter(s => s.done).length / subtasks.length) * 100} />
        <div className="mt-4 space-y-2">
          {subtasks.map((s, i) => (
            <div key={i} className={`flex items-center gap-2.5 text-sm ${s.done ? "text-muted-foreground" : "text-foreground"}`}>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${s.done ? "bg-primary border-primary" : "border-border"}`}>
                {s.done && <Check size={9} className="text-primary-foreground" />}
              </div>
              <span className={s.done ? "line-through" : ""}>{s.text}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2 justify-center">
        <Btn variant="ghost" className="text-xs"><BellOff size={12} /> Auto-Reply On</Btn>
        <Btn variant="ghost" className="text-xs"><EyeOff size={12} /> Block Distractions</Btn>
      </div>
      {backendNote && <p className="text-center text-xs text-muted-foreground">{backendNote}</p>}
    </div>
  );
}

// ── Screen: AI Workspace ──────────────────────────────────────────────────

function WorkspaceScreen() {
  const [active, setActive] = useState(0);

  const items = [
    { icon: FileText, type: "Doc",   title: "Research Paper Outline",               desc: "5 sections · 12 sub-points · APA format",    date: "Today 08:14",    badge: "blue"   as const },
    { icon: Layers,   type: "Slides",title: "Client Q3 Strategy Presentation",      desc: "14 slides · executive summary included",    date: "Today 07:50",    badge: "purple" as const },
    { icon: Mail,     type: "Email", title: "Extension Request — Prof. Martinez",   desc: "72-hour extension · professional tone",      date: "Today 08:02",    badge: "amber"  as const },
    { icon: BookOpen, type: "Plan",  title: "Study Plan: Data Structures Exam",     desc: "7-day schedule · 3h/day · spaced repetition",date: "Yesterday",      badge: "green"  as const },
    { icon: Activity, type: "Notes", title: "Sprint Planning Meeting Summary",      desc: "8 action items · 3 owners assigned",         date: "Yesterday",      badge: "blue"   as const },
    { icon: FileText, type: "Doc",   title: "Project Proposal: Mobile App Redesign",desc: "Executive summary · timeline · budget",     date: "Mon 28 Jun",     badge: "purple" as const },
  ];

  const preview = [
    "# Research Paper: AI in Healthcare",
    "",
    "## 1. Introduction",
    "Overview of AI applications in modern healthcare delivery systems...",
    "",
    "## 2. Literature Review",
    "Analysis of 15 peer-reviewed sources from 2020–2025...",
    "",
    "## 3. Methodology",
    "Mixed-methods approach combining quantitative analysis...",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>AI Workspace</h2>
        <Btn variant="primary"><Plus size={14} /> Generate New</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* File list */}
        <div className="lg:col-span-2 space-y-2">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${active === i ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/40"}`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active === i ? "bg-primary/10" : "bg-muted"}`}>
                  <item.icon size={14} className={active === i ? "text-primary" : "text-muted-foreground"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant={item.badge}>{item.type}</Badge>
                  </div>
                  <p className="text-xs font-medium mt-1 leading-tight">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.desc}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{item.date}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Preview panel */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={items[active].badge}>{items[active].type}</Badge>
              <span className="text-sm font-medium">{items[active].title}</span>
            </div>
            <div className="flex gap-1.5">
              <Btn variant="secondary" className="text-xs p-2"><Eye size={13} /></Btn>
              <Btn variant="secondary" className="text-xs p-2"><Send size={13} /></Btn>
            </div>
          </div>
          <div className="bg-muted/40 rounded-lg p-4 font-mono text-xs leading-relaxed text-muted-foreground min-h-64 whitespace-pre-line">
            {preview.join("\n")}
          </div>
          <div className="flex gap-2 mt-4">
            <Btn variant="primary" className="text-xs flex-1 justify-center">Open in Google Docs</Btn>
            <Btn variant="secondary" className="text-xs"><RefreshCw size={12} /> Regenerate</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Screen: Analytics ────────────────────────────────────────────────────

function AnalyticsScreen() {
  const clutchEvents = [
    { title: "Research Paper saved 30min before deadline", pts: "+150", color: "text-emerald-500" },
    { title: "Completed 5 tasks in a single focus session", pts: "+80",  color: "text-emerald-500" },
    { title: "3 consecutive Pomodoros without interruption", pts: "+60",  color: "text-emerald-500" },
    { title: "Snoozed 4 times before starting task",         pts: "−30",  color: "text-rose-500"   },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Analytics</h2>
        <div className="flex border border-border rounded-lg overflow-hidden">
          {["Week", "Month", "Quarter"].map((p, i) => (
            <button key={p} className={`px-3 py-1.5 text-xs transition-colors cursor-pointer ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Clutch Score",        value: "847",  sub: "+62 this week",   icon: Star,       color: "text-amber-500" },
          { label: "Deadline Survival",   value: "91%",  sub: "10 of 11 saved",  icon: Shield,     color: "text-emerald-500" },
          { label: "Avg Completion Rate", value: "78%",  sub: "↑ 6% vs last week",icon: TrendingUp, color: "text-primary" },
          { label: "Focus Hours",         value: "18.4h",sub: "This week",       icon: Cpu,        color: "text-violet-500" },
        ].map((k, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${k.color}`}>{k.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
              </div>
              <k.icon size={18} className={`${k.color} opacity-60`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly productivity */}
        <Card className="lg:col-span-2">
          <h3 className="mb-4">Weekly Productivity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analyticsWeekly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="var(--chart-1)" fill="url(#gradScore)" strokeWidth={2} name="Score" />
              <Area type="monotone" dataKey="tasks" stroke="var(--chart-2)" fill="url(#gradTasks)" strokeWidth={2} name="Tasks" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Deadline breakdown */}
        <Card>
          <h3 className="mb-4">Deadline Status</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={deadlinePie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {deadlinePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {deadlinePie.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Focus hours bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="mb-4">Focus Hours by Day</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={analyticsWeekly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="focus" fill="var(--chart-4)" radius={[4, 4, 0, 0]} name="Focus Hours" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Clutch score log */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-amber-500" />
            <h3>Clutch Score Log</h3>
          </div>
          <div className="space-y-2.5">
            {clutchEvents.map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-xs font-semibold font-mono flex-shrink-0 ${e.color}`}>{e.pts}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{e.title}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<BackendUser | null>(null);
  const [dashboard, setDashboard] = useState<BackendDashboard | null>(null);
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [backendStatus, setBackendStatus] = useState<"connecting" | "connected" | "offline">("connecting");

  const loadBackendData = useCallback(async (activeUser: BackendUser) => {
    setBackendStatus("connecting");
    try {
      const [dashboardData, taskData] = await Promise.all([
        api.getDashboard(activeUser.id),
        api.getTasks(activeUser.id),
      ]);
      setDashboard(dashboardData);
      setTasks(taskData);
      setBackendStatus("connected");
    } catch {
      setBackendStatus("offline");
    }
  }, []);

  const login = async () => {
    setScreen("dashboard");
    setBackendStatus("connecting");
    try {
      const activeUser = await api.createDemoUser();
      setUser(activeUser);
      await loadBackendData(activeUser);
    } catch {
      setBackendStatus("offline");
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (screen === "login") {
    return (
      <div className={dark ? "dark" : ""}>
        <div className="fixed top-4 right-4 z-50">
          <button onClick={() => setDark(d => !d)} className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer shadow-sm">
            {dark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-primary" />}
          </button>
        </div>
        <LoginScreen onLogin={login} />
      </div>
    );
  }

  const isPanic = screen === "panic";
  const isFocus = screen === "focus";

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside className={`flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${sidebarOpen ? "w-56" : "w-[60px]"}`}>
          {/* Logo */}
          <div className={`flex items-center gap-2.5 px-3 py-4 border-b border-sidebar-border ${sidebarOpen ? "justify-between" : "justify-center"}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Zap size={15} className="text-primary-foreground" />
              </div>
              {sidebarOpen && <span className="text-sm font-semibold truncate text-sidebar-foreground font-[Plus_Jakarta_Sans]">LML</span>}
            </div>
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors cursor-pointer flex-shrink-0">
                <ChevronLeft size={15} />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {navItems.map(item => {
              const active = screen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setScreen(item.id as Screen); if (!sidebarOpen) setSidebarOpen(true); }}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all cursor-pointer group ${
                    active
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  } ${!sidebarOpen ? "justify-center" : ""}`}
                >
                  <item.icon size={16} className={`flex-shrink-0 ${item.id === "panic" ? "text-rose-500" : ""}`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {sidebarOpen && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar bottom */}
          <div className={`p-2 border-t border-sidebar-border space-y-1 ${sidebarOpen ? "" : "flex flex-col items-center"}`}>
            <button
              onClick={() => setDark(d => !d)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors cursor-pointer ${sidebarOpen ? "w-full" : ""}`}
            >
              {dark ? <Sun size={15} className="text-amber-400 flex-shrink-0" /> : <Moon size={15} className="flex-shrink-0" />}
              {sidebarOpen && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
            </button>
            <button
              onClick={() => {
                setUser(null);
                setDashboard(null);
                setTasks([]);
                setScreen("login");
              }}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors cursor-pointer ${sidebarOpen ? "w-full" : ""}`}
            >
              <LogOut size={15} className="flex-shrink-0" />
              {sidebarOpen && <span>Sign out</span>}
            </button>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors cursor-pointer">
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                {navItems.find(n => n.id === screen)?.label ?? ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Panic indicator */}
              {isPanic && <Badge variant="rose">Emergency Active</Badge>}
              {isFocus && <Badge variant="purple">Focus Session</Badge>}
              <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground">
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                AJ
              </div>
            </div>
          </header>

          {/* Screen content */}
          <main className="flex-1 overflow-y-auto p-5">
            {screen === "dashboard"  && <DashboardScreen onNavigate={setScreen} dashboard={dashboard} tasks={tasks} backendStatus={backendStatus} />}
            {screen === "ai-command" && <AICommandScreen userId={user?.id ?? null} />}
            {screen === "calendar"   && <CalendarScreen />}
            {screen === "tasks"      && <TasksScreen tasks={tasks} />}
            {screen === "deadlines"  && <DeadlineCenterScreen onNavigate={setScreen} />}
            {screen === "panic"      && <PanicModeScreen onNavigate={setScreen} userId={user?.id ?? null} />}
            {screen === "focus"      && <FocusModeScreen userId={user?.id ?? null} />}
            {screen === "workspace"  && <WorkspaceScreen />}
            {screen === "analytics"  && <AnalyticsScreen />}
          </main>
        </div>
      </div>
    </div>
  );
}

