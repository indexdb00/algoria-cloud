import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { sendAgentMessage } from "@/lib/chat.functions";
import { Sparkles, Send, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/dashboard/admin/chat")({
  component: AdminChat,
});

type Msg = { role: "user" | "assistant"; content: string };

function AdminChat() {
  const send = useServerFn(sendAgentMessage);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function submit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const res = await send({
        data: {
          conversationId: convId ?? undefined,
          agentSlug: "algoria",
          message: `[ADMIN MODE · CLAUDE] ${text}\n\nContext: you are speaking with the Algoria platform owner. Answer factually about platform health, ToS compliance audits, and operational status. Be direct and skip marketing speak.`,
          variant: "claude",
        },
      });
      if (res?.conversationId) setConvId(res.conversationId);
      const r = res as { reply?: string; error?: string | null };
      setMessages((m) => [...m, { role: "assistant", content: r?.reply || r?.error || "(no reply)" }]);
    } finally { setBusy(false); }
  }

  return (
    <div className="rounded-2xl bg-brand-surface ring-1 ring-brand-border overflow-hidden flex flex-col h-[70vh]">
      <div className="px-5 py-3 border-b border-brand-border flex items-center gap-2">
        <ShieldCheck className="size-4 text-neon" />
        <span className="text-sm font-medium">Admin Chat</span>
        <span className="text-[10px] uppercase tracking-widest text-brand-muted ml-auto">Unlimited · Thinking model</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-xs text-brand-muted py-12">
            Ask anything — "How is the platform performing today?", "List recent users that may violate ad policy", "Summarize the last 24h of messages".
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={"flex gap-3 " + (m.role === "user" ? "justify-end" : "")}>
            {m.role === "assistant" && (
              <div className="size-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shrink-0">
                <Sparkles className="size-3.5 text-white" />
              </div>
            )}
            <div className={"max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed " + (m.role === "user" ? "bg-brand-bg ring-1 ring-brand-border" : "bg-brand-bg/50 ring-1 ring-brand-border")}>
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {busy && <div className="text-xs text-brand-muted">Thinking…</div>}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-brand-border flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); } }}
          rows={2}
          className="input-base flex-1 resize-none"
          placeholder="Ask about platform health, compliance, users…"
        />
        <button onClick={submit} disabled={busy || !input.trim()} className="btn-neon-solid text-sm px-4 py-2.5 inline-flex items-center gap-2 rounded-xl shrink-0">
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
