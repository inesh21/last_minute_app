import { useNavigate } from "react-router";
import {
  Clock, ChevronRight, Brain, Mail, Coffee, Zap,
} from "lucide-react";
import type { BackendDashboard, BackendTask, BackendUser } from "../services/api";
import { Card, Badge, ProgressBar, Btn } from "../components/shared";
import {
  type ThreatLevel, threatConfig, normalizeThreat,
  taskFromBackend, toPercent,
} from "../lib/helpers";

export function DashboardPage({
  dashboard,
  tasks: backendTasks,
  backendStatus,
  user,
}: {
  dashboard: BackendDashboard | null;
  tasks: BackendTask[];
  backendStatus: "connecting" | "connected" | "offline";
  user: BackendUser | null;
}) {
  const navigate = useNavigate();
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

  if (backendStatus === "connecting") {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div><div className="h-7 w-48 bg-muted rounded" /><div className="h-4 w-64 bg-muted rounded mt-2" /></div>
          <div className="h-9 w-28 bg-muted rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";
  const dateStr = new Intl.DateTimeFormat(undefined, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(now);
  const timeStr = new Intl.DateTimeFormat(undefined, {
    hour: "numeric", minute: "2-digit",
  }).format(now);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>{greeting}, {firstName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{dateStr} · {timeStr}</p>
        </div>
        <Btn variant="secondary" onClick={() => navigate("/panic")}>
          <Zap size={14} /> Panic Mode
        </Btn>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3>Today's Tasks</h3>
            <button onClick={() => navigate("/tasks")} className="text-xs text-primary hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></button>
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

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3>Upcoming Deadlines</h3>
          <button onClick={() => navigate("/deadlines")} className="text-xs text-primary hover:underline flex items-center gap-1">Deadline Center <ChevronRight size={12} /></button>
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
