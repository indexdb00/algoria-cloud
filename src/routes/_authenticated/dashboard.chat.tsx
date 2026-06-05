import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useI18n, type LangCode } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { sendAgentMessage } from "@/lib/chat.functions";
import { Send, Sparkles, Activity, GitBranch, Plug, Zap, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/chat")({
  head: () => ({ meta: [{ title: "Chat — Aurevia" }] }),
  component: UnifiedChat,
});

const PRESETS: Record<LangCode, { label: string; prompt: string }[]> = {
  en: [
    { label: "Launch Meta Ads", prompt: "Launch a Meta Ads campaign for my product, €25/day, target European founders aged 28–45 interested in B2B SaaS. Use the CAMPAIGN block format." },
    { label: "Score my leads", prompt: "Score my last 50 leads by buying intent and tell me which to call first." },
    { label: "Audit brand voice", prompt: "Audit my current brand voice in 3 bullets and suggest tone fixes." },
    { label: "3h performance pulse", prompt: "Give me a 3-hour performance pulse across every connected channel." },
    { label: "TikTok reach plan", prompt: "Plan a 2-week TikTok Ads reach push for Spain + Italy. Use the CAMPAIGN block format." },
    { label: "Google Ads search", prompt: "Set up a Google Ads search campaign for my SaaS demo, €40/day, DACH. Use the CAMPAIGN block format." },
  ],
  pt: [
    { label: "Lançar Meta Ads", prompt: "Lança uma campanha Meta Ads para o meu produto, €25/dia, público de founders europeus 28–45 interessados em SaaS B2B. Usa o formato CAMPAIGN." },
    { label: "Pontuar leads", prompt: "Pontua os meus últimos 50 leads por intenção de compra e diz quais ligar primeiro." },
    { label: "Auditar marca", prompt: "Audita o meu tom de marca em 3 pontos e sugere ajustes." },
    { label: "Pulso de 3h", prompt: "Dá-me o pulso de performance das últimas 3h em cada canal conectado." },
    { label: "TikTok alcance", prompt: "Planeia 2 semanas de TikTok Ads para alcance em Espanha + Itália. Formato CAMPAIGN." },
    { label: "Google Search", prompt: "Cria uma campanha Google Ads de search para demo SaaS, €40/dia, DACH. Formato CAMPAIGN." },
  ],
  es: [
    { label: "Lanzar Meta Ads", prompt: "Lanza una campaña Meta Ads, €25/día, founders europeos 28–45 interesados en SaaS B2B. Usa el formato CAMPAIGN." },
    { label: "Puntuar leads", prompt: "Puntúa mis últimos 50 leads por intención y dime a cuáles llamar primero." },
    { label: "Auditar marca", prompt: "Audita mi tono de marca en 3 puntos." },
    { label: "Pulso 3h", prompt: "Dame el pulso de 3h en cada canal conectado." },
    { label: "TikTok", prompt: "Plan TikTok Ads 2 semanas en España + Italia. Formato CAMPAIGN." },
    { label: "Google", prompt: "Campaña Google Ads search, €40/día, DACH. Formato CAMPAIGN." },
  ],
  fr: [
    { label: "Lancer Meta Ads", prompt: "Lance une campagne Meta Ads, 25€/jour, fondateurs européens 28–45 SaaS B2B. Format CAMPAIGN." },
    { label: "Scorer leads", prompt: "Score mes 50 derniers leads par intention." },
    { label: "Audit marque", prompt: "Audite ma voix de marque en 3 points." },
    { label: "Pulse 3h", prompt: "Pulse de performance 3h sur chaque canal." },
    { label: "TikTok", prompt: "Plan TikTok Ads 2 semaines Espagne + Italie. Format CAMPAIGN." },
    { label: "Google", prompt: "Campagne Google Ads search 40€/jour DACH. Format CAMPAIGN." },
  ],
  de: [
    { label: "Meta Ads starten", prompt: "Starte eine Meta Ads Kampagne, €25/Tag, europäische Founder 28–45, B2B SaaS. CAMPAIGN-Format." },
    { label: "Leads bewerten", prompt: "Bewerte meine letzten 50 Leads nach Kaufabsicht." },
    { label: "Marken-Audit", prompt: "Audit meiner Markenstimme in 3 Punkten." },
    { label: "3h Puls", prompt: "Gib mir den 3h Puls pro Kanal." },
    { label: "TikTok", prompt: "2-Wochen TikTok Ads Plan ES + IT. CAMPAIGN-Format." },
    { label: "Google", prompt: "Google Ads Search Kampagne €40/Tag DACH. CAMPAIGN-Format." },
  ],
  it: [
    { label: "Lancia Meta Ads", prompt: "Lancia una campagna Meta Ads, €25/giorno, founder europei 28–45 B2B SaaS. Formato CAMPAIGN." },
    { label: "Score lead", prompt: "Valuta i miei ultimi 50 lead per intent." },
    { label: "Audit brand", prompt: "Audit della mia voce di brand in 3 punti." },
    { label: "Pulse 3h", prompt: "Pulse di 3h per canale." },
    { label: "TikTok", prompt: "Piano TikTok Ads 2 settimane ES + IT. Formato CAMPAIGN." },
    { label: "Google", prompt: "Campagna Google Ads search €40/giorno DACH. Formato CAMPAIGN." },
  ],
};

type Msg = { role: "user" | "assistant"; content: string };

function UnifiedChat() {
  const { t, lang } = useI18n();
  const send = useServerFn(sendAgentMessage);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [cost, setCost] = useState(2);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: agent } = await supabase.from("agents").select("cost_per_message").eq("slug", "aurevia").maybeSingle();
      if (agent?.cost_per_message) setCost(agent.cost_per_message);

      // Resume most recent aurevia conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("agent_slug", "aurevia")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (conv?.id) {
        setConversationId(conv.id);
        const { data: msgs } = await supabase
          .from("messages")
          .select("role,content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });
        if (msgs) setMessages(msgs as Msg[]);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function submit(text: string) {
    if (!text.trim() || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await send({ data: { conversationId: conversationId ?? undefined, agentSlug: "aurevia", message: text, language: lang } });
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

  function newConversation() {
    setConversationId(null);
    setMessages([]);
  }

  const presets = PRESETS[lang] ?? PRESETS.en;

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-4rem)] md:h-screen">
      <header className="h-14 md:h-16 border-b border-brand-border px-4 md:px-8 flex items-center gap-3 shrink-0">
        <div className="size-9 rounded-xl flex items-center justify-center icon-3d shrink-0">
          <Sparkles className="size-4 text-[oklch(0.16_0.01_160)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">Aurevia</div>
          <div className="text-[10px] uppercase tracking-widest text-brand-muted">
            {t("dash.cost")} {cost} {t("dash.credits.unit")}
          </div>
        </div>
        <button onClick={newConversation} className="btn-dark p-2" title={t("chat.new")} aria-label={t("chat.new")}>
          <MessageSquarePlus className="size-4" />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neon/80 px-2.5 py-1 rounded-md ring-1 ring-neon/30 bg-neon/5">
          <Activity className="size-3 animate-pulse" /> {t("chat.live")}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="space-y-8">
              <div className="text-center py-6 md:py-10">
                <div className="size-16 mx-auto rounded-2xl flex items-center justify-center mb-5 icon-3d shadow-[0_0_50px_-12px_var(--neon)]">
                  <Sparkles className="size-7 text-[oklch(0.16_0.01_160)]" />
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight mb-2">{t("chat.unified.title")}</h2>
                <p className="text-sm text-brand-muted max-w-md mx-auto">{t("chat.unified.desc")}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-muted mb-3">
                  <Sparkles className="size-3 text-neon" /> {t("chat.presets")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => submit(p.prompt)}
                      className="text-left text-xs p-3.5 rounded-xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/50 hover:text-neon transition-all"
                    >
                      <div className="text-[10px] uppercase tracking-widest text-neon mb-1">{p.label}</div>
                      <div className="text-brand-muted line-clamp-2">{p.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/dashboard/funnel" className="flex items-center gap-2 p-3 rounded-xl ring-1 ring-brand-border bg-brand-surface hover:ring-neon/40">
                  <GitBranch className="size-4 text-neon" />
                  <div className="text-xs">{t("chat.cta.funnel")}</div>
                </Link>
                <Link to="/dashboard/integrations" className="flex items-center gap-2 p-3 rounded-xl ring-1 ring-brand-border bg-brand-surface hover:ring-neon/40">
                  <Plug className="size-4 text-neon" />
                  <div className="text-xs">{t("chat.cta.integrations")}</div>
                </Link>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-brand-surface ring-1 ring-brand-border rounded-2xl px-4 py-3 text-sm flex items-center gap-1.5">
                <Zap className="size-3 text-neon animate-pulse" />
                <span className="size-1.5 rounded-full bg-neon animate-pulse" />
                <span className="size-1.5 rounded-full bg-neon animate-pulse [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-neon animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(input.trim()); }} className="border-t border-brand-border px-4 md:px-8 py-3 md:py-4 shrink-0 bg-brand-bg/80 backdrop-blur">
        <div className="max-w-3xl mx-auto flex items-end gap-2 md:gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input.trim());
              }
            }}
            rows={1}
            placeholder={t("dash.messagePlaceholder")}
            className="flex-1 bg-brand-surface ring-1 ring-brand-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-neon transition-shadow min-h-[48px] max-h-40"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="size-12 shrink-0 btn-neon-solid flex items-center justify-center disabled:opacity-40 rounded-xl"
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
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed bg-neon text-[oklch(0.14_0.01_160)] font-medium">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-brand-surface text-brand-text ring-1 ring-brand-border prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:text-neon prose-strong:text-neon prose-a:text-neon">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
