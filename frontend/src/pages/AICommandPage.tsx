import { useState, useRef, useEffect } from "react";
import { Brain, Send } from "lucide-react";
import { Card } from "../components/shared";
import { api } from "../services/api";

export function AICommandPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello Alex. I've reviewed your schedule and detected 2 high-risk deadlines today. How can I help you right now?" },
    { role: "user", text: "I can't finish my research paper by tonight." },
    { role: "assistant", text: "Understood. Based on your current progress (34%) and estimated writing speed, finishing is unlikely without intervention.\n\nI've prepared three actions:\n1. Drafted a 3-day extension email to your professor — ready to send\n2. Blocked 4 focus sessions (1h each) starting at 9 AM today\n3. Generated a detailed outline with 15-minute micro tasks\n\nShall I execute all three now?" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Move my 2 PM meeting",
    "Help me study for Thursday's exam",
    "I have only 90 minutes — what should I do?",
    "Create presentation slides for client",
    "Generate extension email for professor",
  ];

  const send = async () => {
    if (!input.trim()) return;
    const message = input;
    setMessages(m => [...m, { role: "user", text: message }]);
    setInput("");

    try {
      const response = await api.chat(message);
      const toolSummary = response.tool_calls.length
        ? `\n\nTools: ${response.tool_calls.map(tool => `${tool.name} (${tool.status})`).join(", ")}`
        : "";
      const recommendations = response.recommendations.length
        ? `\n\nNext:\n${response.recommendations.map(item => `- ${item}`).join("\n")}`
        : "";
      setMessages(m => [...m, { role: "assistant", text: `${response.message}${toolSummary}${recommendations}` }]);
    } catch (error) {
      setMessages(m => [...m, { role: "assistant", text: `Request failed: ${error instanceof Error ? error.message : "Unknown error"}` }]);
    }
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-h-[800px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain size={18} className="text-primary" />
        </div>
        <div>
          <h2>AI Command Center</h2>
          <p className="text-xs text-muted-foreground">Powered by Gemini 2.5 Flash · Function calling enabled</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Active</span>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Brain size={13} className="text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="px-4 py-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="flex-shrink-0 text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-accent transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Tell the AI what you need help with..."
            className="flex-1 bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50 transition-colors"
          />
          <button
            onClick={send}
            className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Send size={14} className="text-primary-foreground" />
          </button>
        </div>
      </Card>
    </div>
  );
}
