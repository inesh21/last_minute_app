import { useState } from "react";
import {
  Zap, Check, CheckSquare, BellOff, RefreshCw, X,
  Timer, FileText, FolderOpen, Loader2,
  Mail, Eye, Send, ExternalLink,
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

  const [draftPreview, setDraftPreview] = useState(false);
  const [draftSending, setDraftSending] = useState(false);
  const [draftUrl, setDraftUrl] = useState("");
  const [draftError, setDraftError] = useState("");

  const [docCreating, setDocCreating] = useState(false);
  const [docUrl, setDocUrl] = useState("");
  const [docError, setDocError] = useState("");

  const [actionBusy, setActionBusy] = useState<number | null>(null);

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
        { text: "Backend Panic Mode call failed — continue with local checklist", done: false },
      ]);
    }
  };

  const sendToDrafts = async () => {
    setDraftSending(true);
    setDraftError("");
    try {
      const result = await api.createGmailDraft(
        "professor@university.edu",
        "Request for Extension — Assignment Deadline",
        "Dear Professor,\n\nI hope this email finds you well. I am writing to respectfully request a 72-hour extension on the upcoming assignment deadline. Due to unforeseen academic workload and personal circumstances, I need additional time to ensure the quality of my submission.\n\nI am committed to delivering excellent work and would greatly appreciate your consideration.\n\nThank you for your understanding.\n\nBest regards"
      );
      setDraftUrl(result.url);
    } catch (e) {
      setDraftError(e instanceof Error ? e.message : "Failed to create draft");
    } finally {
      setDraftSending(false);
    }
  };

  const generateFirstDraft = async () => {
    setDocCreating(true);
    setDocError("");
    try {
      const result = await api.createGoogleDoc("Emergency Draft — Paper Outline");
      setDocUrl(result.url);
    } catch (e) {
      setDocError(e instanceof Error ? e.message : "Failed to create document");
    } finally {
      setDocCreating(false);
    }
  };

  const emergencyActions = [
    { icon: BellOff,    label: "Pause Notifications",  desc: "All alerts silenced",     action: async () => { /* UI-only */ } },
    { icon: RefreshCw,  label: "Reorder Schedule",     desc: "AI reoptimizes your day",  action: async () => { await api.chat("Reorder my schedule to prioritize the most urgent task"); } },
    { icon: X,          label: "Cancel Low-Priority",  desc: "3 tasks will be moved",    action: async () => { /* UI-only */ } },
    { icon: Timer,      label: "Start 90min Timer",    desc: "Pomodoro focus session",   action: async () => { await api.focus("Emergency task", 90); } },
    { icon: FileText,   label: "Generate First Draft", desc: "AI writes paper skeleton", action: generateFirstDraft },
    { icon: FolderOpen, label: "Open Required Files",  desc: "Paper, notes, rubric",     action: async () => { /* UI-only */ } },
  ];

  const handleAction = async (i: number) => {
    setActionBusy(i);
    try {
      await emergencyActions[i].action();
    } catch { /* silently handle */ }
    setActionBusy(null);
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
            {emergencyActions.map((a, i) => (
              <button
                key={i}
                onClick={() => handleAction(i)}
                disabled={actionBusy === i}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer hover:border-primary/40 disabled:opacity-60 ${active ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900" : "bg-card border-border hover:bg-muted/50"}`}
              >
                {actionBusy === i
                  ? <Loader2 size={18} className="animate-spin text-primary mb-2" />
                  : <a.icon size={18} className={active ? "text-rose-500 mb-2" : "text-primary mb-2"} />
                }
                <p className="text-sm font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </button>
            ))}
          </div>

          {docUrl && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-sm">
              <FileText size={14} className="text-emerald-500" />
              <span>Document created!</span>
              <a href={docUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline ml-auto">
                Open <ExternalLink size={12} />
              </a>
            </div>
          )}
          {docError && (
            <p className="text-sm text-destructive">{docError}</p>
          )}
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

        {draftPreview && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs whitespace-pre-line text-muted-foreground">
            <p className="font-medium text-foreground mb-1">To: professor@university.edu</p>
            <p className="font-medium text-foreground mb-2">Subject: Request for Extension — Assignment Deadline</p>
            Dear Professor,{"\n\n"}
            I hope this email finds you well. I am writing to respectfully request a 72-hour extension on the upcoming assignment deadline. Due to unforeseen academic workload and personal circumstances, I need additional time to ensure the quality of my submission.{"\n\n"}
            I am committed to delivering excellent work and would greatly appreciate your consideration.{"\n\n"}
            Thank you for your understanding.{"\n\n"}
            Best regards
          </div>
        )}

        {draftUrl && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-sm">
            <Check size={14} className="text-emerald-500" />
            <span>Draft saved to Gmail!</span>
            <a href={draftUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline ml-auto">
              Open in Gmail <ExternalLink size={12} />
            </a>
          </div>
        )}

        {draftError && (
          <p className="mt-2 text-sm text-destructive">{draftError}</p>
        )}

        <div className="flex gap-2 mt-3">
          <Btn variant="secondary" className="text-xs" onClick={() => setDraftPreview(!draftPreview)}>
            <Eye size={12} /> {draftPreview ? "Hide Preview" : "Preview Email"}
          </Btn>
          <Btn variant="primary" className="text-xs" onClick={sendToDrafts} disabled={draftSending || !!draftUrl}>
            {draftSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {draftUrl ? "Sent to Drafts" : "Send to Drafts"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
