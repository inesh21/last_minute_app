import { useState, useEffect } from "react";
import {
  Play, Pause, SkipForward, RefreshCw,
  Check, BellOff, EyeOff,
} from "lucide-react";
import { Card, Badge, ProgressBar, Btn } from "../components/shared";
import { api } from "../services/api";

export function FocusModePage() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(5400);
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
    if (!nextRunning) return;

    try {
      const response = await api.focus("Research Paper: AI in Healthcare", 90);
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
