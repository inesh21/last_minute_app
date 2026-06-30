import { useState, useRef, useEffect } from "react";
import { Brain, Send, Loader2, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Card, Badge } from "../components/shared";
import { api, type BackendToolCall } from "../services/api";

type Message = {
  role: "user" | "assistant";
  text: string;
  toolCalls?: BackendToolCall[];
};

function ToolCallDisplay({ tc }: { tc: BackendToolCall }) {
  const ok = tc.status === "completed";
  const result = tc.result as Record<string, unknown> | null;
  const url = result?.url as string | undefined;
  const title = result?.title as string | undefined;

  return (
    <div className={`mt-2 p-2 rounded-lg text-xs border ${ok ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"}`}>
      <div className="flex items-center gap-1.5">
        {ok ? <CheckCircle size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
        <span className="font-medium">{tc.name.replace(/_/g, " ")}</span>
        <Badge variant={ok ? "green" : "red"} className="text-[10px] ml-auto">{tc.status}</Badge>
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 mt-1 text-primary hover:underline"
        >
          {title || "Open"} <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
}

export function AICommandPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hello! I'm your AI Chief of Staff powered by Gemini. I can manage your calendar, read emails, create documents, draft messages, and more. How can I help?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "What's on my calendar today?",
    "Show my recent emails",
    "Create a Google Doc for my notes",
    "Draft an email to request an extension",
    "Create presentation slides",
    "List my Google Tasks",
  ];

  const send = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;
    setMessages(m => [...m, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.chat(message);
      const toolCalls = response.tool_calls.length > 0 ? response.tool_calls : undefined;
      setMessages(m => [...m, {
        role: "assistant",
        text: response.message,
        toolCalls,
      }]);
    } catch (error) {
      setMessages(m => [...m, {
        role: "assistant",
        text: `Something went wrong: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

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
          <span className={`w-2 h-2 rounded-full ${loading ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`} />
          <span className="text-xs text-muted-foreground">{loading ? "Thinking..." : "Ready"}</span>
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
              <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                <span className="whitespace-pre-line">{m.text}</span>
                {m.toolCalls?.map((tc, j) => <ToolCallDisplay key={j} tc={tc} />)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <Brain size={13} className="text-primary" />
              </div>
              <div className="bg-muted rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking and executing tools...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="px-4 py-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                disabled={loading}
                className="flex-shrink-0 text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
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
            disabled={loading}
            className="flex-1 bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={loading}
            className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin text-primary-foreground" /> : <Send size={14} className="text-primary-foreground" />}
          </button>
        </div>
      </Card>
    </div>
  );
}
