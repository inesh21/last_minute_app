import { useNavigate } from "react-router";
import { Clock, ChevronRight, Zap } from "lucide-react";
import type { BackendTask } from "../services/api";
import { Card, Badge, ProgressBar } from "../components/shared";
import { taskFromBackend, toPercent, formatDeadline } from "../lib/helpers";

export function DeadlineCenterPage({ tasks: backendTasks }: { tasks: BackendTask[] }) {
  const navigate = useNavigate();
  const openTasks = backendTasks.filter(t => t.status !== "done" && t.deadline_at);
  const useBackendData = openTasks.length > 0;

  const backendDeadlines = openTasks.map(t => {
    const deadlineDate = new Date(t.deadline_at!);
    const now = new Date();
    const msRemaining = deadlineDate.getTime() - now.getTime();
    const hoursRemaining = Math.max(0, msRemaining / (1000 * 60 * 60));
    const timeLeft = hoursRemaining >= 24
      ? `${Math.round(hoursRemaining / 24)}d ${Math.round(hoursRemaining % 24)}h`
      : `${Math.round(hoursRemaining)}h ${Math.round((hoursRemaining % 1) * 60)}m`;
    const prob = toPercent(t.completion_probability);
    const risk = toPercent(t.risk_score);
    const color = risk >= 70 ? "rose" : risk >= 40 ? "orange" : risk >= 20 ? "amber" : "green";
    return {
      title: t.title,
      due: formatDeadline(t.deadline_at),
      timeLeft,
      prob,
      color,
      actions: [
        "Break into micro-tasks",
        "Start Focus Mode",
        ...(prob < 50 ? ["Draft extension email"] : []),
      ],
    };
  });

  const hardcodedDeadlines = [
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

  const deadlines = useBackendData ? backendDeadlines : hardcodedDeadlines;
  const criticalCount = deadlines.filter(d => d.color === "rose" || d.color === "orange").length;

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
        <Badge variant="rose">{criticalCount} Critical</Badge>
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
                    <button onClick={() => navigate("/panic")} className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 px-2.5 py-1.5 rounded-lg hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1 font-medium">
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
