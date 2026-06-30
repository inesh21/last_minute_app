import { Star, Shield, TrendingUp, Cpu } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Card } from "../components/shared";

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

export function AnalyticsPage() {
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
