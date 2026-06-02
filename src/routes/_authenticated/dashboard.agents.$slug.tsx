import { createFileRoute, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { sendAgentMessage } from "@/lib/chat.functions";
import { Send, Megaphone, Users, Globe, Square, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/agents/$slug")({
  component: AgentChat,
});

const ICONS: Record<string, typeof Megaphone> = {
  ads: Megaphone, leads: Users, reach: Globe, brand: Square, reports: FileText,
};

type Msg = { role: "user" | "assistant"; content: string };

function AgentChat() {
  const { slug } = useParams({ from: "/_authenticated/dashboard/agents/$slug" });
  const { t } = useI18n();
  const send = useServerFn(sendAgentMessage);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [cost, setCost] = useState(2);
  const scrollRef = useRef<HTMLDivElement>(null);

  const Icon = ICONS[slug] ?? Square;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("agents")
        .select("name,cost_per_message")
        .eq("slug", slug)
        .single();
      setAgentName(data?.name ?? slug);
      setCost(data?.cost_per_message ?? 2);
    })();
    setMessages([]);
    setConversationId(null);
  }, [slug]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await send({ data: { conversationId: conversationId ?? undefined, agentSlug: slug, message: text } });
      if (res.error) {
        toast.error(res.error);
        setMessages((m) => m.slice(0, -1));
      } else {
        if (res.conversationId) setConversationId(res.conversationId);
        setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 border-b border-brand-border px-8 flex items-center gap-3 shrink-0">
        <div className="size-8 bg-brand-surface rounded-lg flex items-center justify-center">
          <Icon className="size-4 text-brand-text" />
        </div>
        <div>
          <div className="text-sm font-medium">{agentName}</div>
          <div className="text-[10px] uppercase tracking-widest text-brand-muted">
            {t("dash.cost")} {cost} {t("dash.credits.unit")}
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="size-12 mx-auto bg-brand-surface rounded-xl flex items-center justify-center mb-4">
                <Icon className="size-5 text-brand-text" />
              </div>
              <h2 className="font-heading text-2xl font-medium tracking-tight mb-2">{agentName}</h2>
              <p className="text-sm text-brand-muted max-w-md mx-auto">{t("dash.startChat")}</p>
            </div>
          )}
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {sending && <Bubble role="assistant" content="…" />}
        </div>
      </div>

      <form onSubmit={onSend} className="border-t border-brand-border px-8 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend(e as unknown as React.FormEvent);
              }
            }}
            rows={1}
            placeholder={t("dash.messagePlaceholder")}
            className="flex-1 bg-brand-surface ring-1 ring-brand-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-brand-accent transition-shadow min-h-[48px] max-h-40"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="size-12 shrink-0 bg-brand-accent text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity"
            aria-label={t("dash.send")}
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Bubble({ role, content }: Msg) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed " +
          (isUser
            ? "bg-brand-accent text-white"
            : "bg-brand-surface text-brand-text ring-1 ring-brand-border")
        }
      >
        {content}
      </div>
    </div>
  );
}
