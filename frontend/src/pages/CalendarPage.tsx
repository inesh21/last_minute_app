import { useState, useEffect } from "react";
import {
  Brain, ChevronLeft, ChevronRight, Check, X, Plus, RefreshCw, Trash2, Loader2,
} from "lucide-react";
import { Card, Btn } from "../components/shared";
import { api, type CalendarEvent } from "../services/api";

export function CalendarPage() {
  const [view, setView] = useState<"week" | "month">("week");
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  const loadEvents = () => {
    setLoading(true);
    api.getCalendarEvents(7)
      .then(data => setCalEvents(data.events))
      .catch(() => setCalEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const data = await api.syncCalendarEvents(14);
      setCalEvents(data.events);
    } catch {
      loadEvents();
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newStart || !newEnd) return;
    setCreating(true);
    try {
      await api.createCalendarEvent(
        newTitle.trim(),
        new Date(newStart).toISOString(),
        new Date(newEnd).toISOString(),
        newDescription.trim(),
      );
      setShowCreate(false);
      setNewTitle("");
      setNewDescription("");
      setNewStart("");
      setNewEnd("");
      loadEvents();
    } catch {
      alert("Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Delete this event from Google Calendar?")) return;
    setDeletingId(eventId);
    try {
      await api.deleteCalendarEvent(eventId);
      setCalEvents(prev => prev.filter(e => e.id !== eventId));
    } catch {
      alert("Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

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

  function formatTime(dt?: string) {
    if (!dt) return "";
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(dt));
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
          <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={13} /> New Event</Btn>
          <Btn variant="secondary" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} /> {syncing ? "Syncing..." : "Sync"}
          </Btn>
          <div className="flex border border-border rounded-lg overflow-hidden">
            {(["week", "month"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs capitalize transition-colors cursor-pointer ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{v}</button>
            ))}
          </div>
          <Btn variant="secondary"><ChevronLeft size={13} /></Btn>
          <span className="text-sm font-medium">
            {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(today)}
          </span>
          <Btn variant="secondary"><ChevronRight size={13} /></Btn>
        </div>
      </div>

      {showCreate && (
        <Card className="border-primary/30">
          <h3 className="mb-3">Create New Event</h3>
          <div className="space-y-3">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Event title"
              className="w-full bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50"
            />
            <textarea
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                <input
                  type="datetime-local"
                  value={newStart}
                  onChange={e => setNewStart(e.target.value)}
                  className="w-full bg-input-background rounded-lg px-3 py-2 text-sm border border-border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End</label>
                <input
                  type="datetime-local"
                  value={newEnd}
                  onChange={e => setNewEnd(e.target.value)}
                  className="w-full bg-input-background rounded-lg px-3 py-2 text-sm border border-border"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={handleCreate} disabled={creating || !newTitle.trim() || !newStart || !newEnd}>
                {creating ? "Creating..." : "Create Event"}
              </Btn>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading calendar...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-3 p-0 overflow-hidden">
            <div className="grid grid-cols-6 border-b border-border">
              <div className="p-3 text-xs text-muted-foreground" />
              {days.map(d => {
                const todayStr = `${dayNames[today.getDay()]} ${today.getDate()}`;
                return (
                  <div key={d} className={`p-3 text-xs font-medium text-center border-l border-border ${d === todayStr ? "bg-primary/5 text-primary" : "text-muted-foreground"}`}>{d}</div>
                );
              })}
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
                          <div key={ev.id} className="text-xs rounded px-1.5 py-1 leading-tight bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 group relative">
                            <div className="font-medium">{ev.summary || "Untitled"}</div>
                            <div className="text-[10px] opacity-70">
                              {formatTime(ev.start?.dateTime)} - {formatTime(ev.end?.dateTime)}
                            </div>
                            <button
                              onClick={() => handleDelete(ev.id)}
                              disabled={deletingId === ev.id}
                              className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-rose-200 dark:hover:bg-rose-800 cursor-pointer"
                              title="Delete event"
                            >
                              {deletingId === ev.id
                                ? <Loader2 size={10} className="animate-spin" />
                                : <Trash2 size={10} className="text-rose-600 dark:text-rose-400" />
                              }
                            </button>
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
            {calEvents.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Upcoming Events</span>
                  <span className="text-xs text-muted-foreground">{calEvents.length} events</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {calEvents.slice(0, 10).map(ev => (
                    <div key={ev.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/40 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ev.summary || "Untitled"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ev.start?.dateTime ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(ev.start.dateTime)) : ev.start?.date || ""}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        disabled={deletingId === ev.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900 cursor-pointer flex-shrink-0"
                      >
                        {deletingId === ev.id
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Trash2 size={11} className="text-rose-500" />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

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
      )}
    </div>
  );
}
