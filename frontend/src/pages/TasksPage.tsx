import { useState } from "react";
import {
  Clock, Timer, ChevronDown, Check, X, Focus, Plus,
} from "lucide-react";
import type { BackendTask } from "../services/api";
import { api } from "../services/api";
import { Card, Badge, ProgressBar, Btn } from "../components/shared";
import { taskFromBackend } from "../lib/helpers";
import type { AppTask } from "../lib/helpers";

export function TasksPage({ tasks: backendTasks, onTasksChange }: { tasks: BackendTask[]; onTasksChange: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState(3);
  const [newMinutes, setNewMinutes] = useState(30);
  const [newDeadline, setNewDeadline] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredBackend = backendTasks.filter(t => {
    if (filter === "All") return true;
    if (filter === "Today") {
      if (!t.deadline_at) return false;
      const d = new Date(t.deadline_at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }
    if (filter === "High Risk") return t.risk_score >= 0.6;
    if (filter === "In Progress") return t.status === "in_progress";
    if (filter === "Done") return t.status === "done";
    return true;
  });

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
  ];
  const tasks = backendTasks.length > 0 ? filteredBackend.map(taskFromBackend) : fallbackTasks;
  const taskIds = backendTasks.length > 0 ? filteredBackend.map(t => t.id) : [];

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await api.createTask(
        newTitle.trim(),
        newDescription.trim(),
        newPriority,
        newMinutes,
        newDeadline ? new Date(newDeadline).toISOString() : null,
      );
      setShowCreate(false);
      setNewTitle("");
      setNewDescription("");
      setNewPriority(3);
      setNewMinutes(30);
      setNewDeadline("");
      onTasksChange();
    } catch {
      alert("Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    setDeletingId(taskId);
    try {
      await api.deleteTask(taskId);
      onTasksChange();
    } catch {
      alert("Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "done") updates.progress = 1.0;
    try {
      await api.updateTask(taskId, updates);
      onTasksChange();
    } catch {
      alert("Failed to update task");
    }
  };

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
        <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={14} /> New Task</Btn>
      </div>

      {showCreate && (
        <Card className="border-primary/30">
          <h3 className="mb-3">Create New Task</h3>
          <div className="space-y-3">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Task title"
              className="w-full bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50"
            />
            <textarea
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50 resize-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(Number(e.target.value))}
                  className="w-full bg-input-background rounded-lg px-3 py-2 text-sm border border-border"
                >
                  <option value={1}>1 - Lowest</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - High</option>
                  <option value={5}>5 - Critical</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Est. Minutes</label>
                <input
                  type="number"
                  value={newMinutes}
                  onChange={e => setNewMinutes(Number(e.target.value))}
                  min={5}
                  className="w-full bg-input-background rounded-lg px-3 py-2 text-sm border border-border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Deadline</label>
                <input
                  type="datetime-local"
                  value={newDeadline}
                  onChange={e => setNewDeadline(e.target.value)}
                  className="w-full bg-input-background rounded-lg px-3 py-2 text-sm border border-border"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={handleCreate} disabled={creating || !newTitle.trim()}>
                {creating ? "Creating..." : "Create Task"}
              </Btn>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {["All", "Today", "High Risk", "In Progress", "Done"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
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
                      {taskIds[i] && (
                        <>
                          <Btn
                            variant={filteredBackend[i]?.status === "done" ? "secondary" : "primary"}
                            className="text-xs"
                            onClick={() => handleToggleComplete(taskIds[i], filteredBackend[i]?.status || "todo")}
                          >
                            <Check size={12} /> {filteredBackend[i]?.status === "done" ? "Reopen" : "Complete"}
                          </Btn>
                          <Btn
                            variant="danger"
                            className="text-xs"
                            onClick={() => handleDelete(taskIds[i])}
                            disabled={deletingId === taskIds[i]}
                          >
                            <X size={12} /> {deletingId === taskIds[i] ? "Deleting..." : "Delete"}
                          </Btn>
                        </>
                      )}
                      <Btn variant="secondary" className="text-xs"><Focus size={12} /> Start Focus</Btn>
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
