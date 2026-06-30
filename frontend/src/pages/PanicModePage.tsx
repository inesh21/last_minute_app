import { useState } from "react";
import {
  Zap, Check, CheckSquare, BellOff, RefreshCw, X,
  Timer, FileText, FolderOpen, Eye, Send, Mail,
} from "lucide-react";
import { Card, Btn, ProgressBar } from "../components/shared";
import { api } from "../services/api";

export function PanicModePage() {
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
    if (!nextActive) return;

    try {
      const response = await api.panic("Current highest-risk task");
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
