import { useState } from "react";
import {
  FileText, Layers, Mail, BookOpen, Activity,
  Eye, Send, Plus, RefreshCw,
} from "lucide-react";
import { Card, Badge, Btn } from "../components/shared";

export function WorkspacePage() {
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
