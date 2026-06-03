import { createFileRoute, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { sendAgentMessage } from "@/lib/chat.functions";
import { Send, Megaphone, Users, Globe, Square, FileText, Sparkles, Activity, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/agents/$slug")({
  component: AgentChat,
});

const ICONS: Record<string, typeof Megaphone> = {
  ads: Megaphone, leads: Users, reach: Globe, brand: Square, reports: FileText,
};

const PRESETS: Record<string, string[]> = {
  ads: [
    "Launch a Meta + Google campaign for my new product (€20/day, EU audience).",
    "How is my current campaign performing today?",
    "Pause the worst performing ad set and reallocate budget.",
    "Suggest 3 new creative angles for my best ad.",
  ],
  leads: [
    "Score my last 50 leads by intent and tell me who to call first.",
    "Build me a lead magnet for SaaS founders in Germany.",
    "Which channel is bringing the highest quality leads this week?",
    "Draft a 3-step nurture sequence in English and German.",
  ],
  reach: [
    "Find 10 European newsletters that fit my brand for sponsorships.",
    "Plan a 2-week organic LinkedIn rollout for our launch.",
    "How is my organic reach trending vs last month?",
    "Suggest 5 viral hooks for TikTok in my niche.",
  ],
  brand: [
    "Audit my brand voice in 3 bullets and fix it.",
    "Write a tagline in EN, PT, DE, FR for our hero section.",
    "Are my campaigns consistent with our brand tone?",
    "Generate a 30-day content pillar plan.",
  ],
  reports: [
    "Give me today's 3-hour pulse on every active channel.",
    "Compare this week vs last week — what changed?",
    "Which KPI deserves my attention right now?",
    "Export a 1-page executive brief for my board.",
  ],
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
  const presets = PRESETS[slug] ?? [];

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

  async function submit(text: string) {
    if (!text.trim() || sending) return;
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

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    submit(input.trim());
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
      <header className="h-14 md:h-16 border-b border-brand-border px-4 md:px-8 flex items-center gap-3 shrink-0">
        <div className="size-8 bg-brand-surface ring-1 ring-brand-border rounded-lg flex items-center justify-center">
          <Icon className="size-4 text-neon" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{agentName}</div>
          <div className="text-[10px] uppercase tracking-widest text-brand-muted">
            {t("dash.cost")} {cost} {t("dash.credits.unit")}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neon/80 px-2.5 py-1 rounded-md ring-1 ring-neon/30 bg-neon/5">
          <Activity className="size-3 animate-pulse" /> Live · 3h pulse
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="space-y-8">
              <div className="text-center py-8 md:py-12">
                <div className="size-14 mx-auto bg-brand-surface ring-1 ring-neon/30 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_40px_-12px_var(--neon)]">
                  <Icon className="size-6 text-neon" />
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight mb-2">{agentName}</h2>
                <p className="text-sm text-brand-muted max-w-md mx-auto">
                  Manage your integrations, launch campaigns by prompt, and ask about performance anytime.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-brand-muted px-2.5 py-1 rounded-md ring-1 ring-brand-border bg-brand-surface">
                  <Clock className="size-3" /> Updates posted every 3 hours
                </div>
              </div>

              {presets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-muted mb-3">
                    <Sparkles className="size-3 text-neon" /> Not sure where to start? Try:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {presets.map((p) => (
                      <button
                        key={p}
                        onClick={() => submit(p)}
                        className="text-left text-xs p-3 rounded-xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/50 hover:text-neon transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-brand-surface ring-1 ring-brand-border rounded-2xl px-4 py-3 text-sm flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-neon animate-pulse" />
                <span className="size-1.5 rounded-full bg-neon animate-pulse [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-neon animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={onSend} className="border-t border-brand-border px-4 md:px-8 py-3 md:py-4 shrink-0 bg-brand-bg/80 backdrop-blur">
        <div className="max-w-3xl mx-auto flex items-end gap-2 md:gap-3">
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
            className="flex-1 bg-brand-surface ring-1 ring-brand-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-neon transition-shadow min-h-[48px] max-h-40"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="size-12 shrink-0 btn-neon-solid flex items-center justify-center disabled:opacity-40"
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
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed " +
          (isUser
            ? "bg-neon text-[oklch(0.14_0.01_160)] font-medium"
            : "bg-brand-surface text-brand-text ring-1 ring-brand-border")
        }
      >
        {content}
      </div>
    </div>
  );
}
