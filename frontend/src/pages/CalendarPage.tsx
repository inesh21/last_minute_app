import { useState, useEffect } from "react";
import {
  Brain, ChevronLeft, ChevronRight, Check, X,
} from "lucide-react";
import { Card, Btn } from "../components/shared";
import { api, type CalendarEvent } from "../services/api";

export function CalendarPage() {
  const [view, setView] = useState<"week" | "month">("week");
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  useEffect(() => {
    setLoading(true);
    api.getCalendarEvents(7)
      .then(data => setCalEvents(data.events))
      .catch(() => setCalEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return `${dayNames[d.getDay()]} ${d.getDate()}`;
  });

  function eventsForDayHour(dayIdx: number, hour: number) {
    const d = new Date(today);
    d.setDate(today.getDate() + dayIdx);
    return calEvents.filter(ev => {
      const start = ev.start?.dateTime || ev.start?.date;
      if (!start) return false;
      const s = new Date(start);
      return s.getDate() === d.getDate() && s.getMonth() === d.getMonth() && s.getHours() === hour;
    });
  }

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
                {days.map((d, dIdx) => {
                  const matchedEvents = eventsForDayHour(dIdx, h);
                  return (
                    <div key={d} className="border-l border-border/50 p-1">
                      {matchedEvents.map(ev => (
                        <div key={ev.id} className="text-xs rounded px-1.5 py-1 leading-tight bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                          <div className="font-medium">{ev.summary || "Untitled"}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

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
