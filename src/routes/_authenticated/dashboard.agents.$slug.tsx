import { createFileRoute, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useI18n, type LangCode } from "@/lib/i18n";
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

// Multilingual presets per agent
const PRESETS: Record<string, Record<LangCode, string[]>> = {
  ads: {
    en: [
      "Launch a Meta + Google campaign for my new product (€20/day, EU audience).",
      "How is my current campaign performing today?",
      "Pause the worst performing ad set and reallocate budget.",
      "Suggest 3 new creative angles for my best ad.",
    ],
    pt: [
      "Lança uma campanha Meta + Google para o meu novo produto (€20/dia, público UE).",
      "Como está a performance da minha campanha hoje?",
      "Pausa o conjunto de anúncios pior e realoca orçamento.",
      "Sugere 3 novos ângulos criativos para o meu melhor anúncio.",
    ],
    es: [
      "Lanza una campaña Meta + Google para mi nuevo producto (€20/día, audiencia UE).",
      "¿Cómo va mi campaña actual hoy?",
      "Pausa el peor conjunto de anuncios y reasigna presupuesto.",
      "Sugiéreme 3 ángulos creativos nuevos para mi mejor anuncio.",
    ],
    fr: [
      "Lance une campagne Meta + Google pour mon nouveau produit (20€/jour, audience UE).",
      "Comment se porte ma campagne aujourd'hui ?",
      "Mets en pause le pire ensemble et réalloue le budget.",
      "Propose 3 angles créatifs pour ma meilleure annonce.",
    ],
    de: [
      "Starte eine Meta + Google Kampagne für mein neues Produkt (€20/Tag, EU-Zielgruppe).",
      "Wie läuft meine Kampagne heute?",
      "Pausiere das schlechteste Ad-Set und verteile das Budget um.",
      "Schlage 3 neue Creative-Winkel für meine beste Anzeige vor.",
    ],
    it: [
      "Lancia una campagna Meta + Google per il mio nuovo prodotto (€20/giorno, audience UE).",
      "Come va la mia campagna oggi?",
      "Metti in pausa il peggior ad set e ridistribuisci il budget.",
      "Suggerisci 3 nuovi angoli creativi per il mio miglior annuncio.",
    ],
  },
  leads: {
    en: ["Score my last 50 leads by intent.", "Build a lead magnet for SaaS founders in Germany.", "Which channel brings the best leads this week?", "Draft a 3-step nurture in EN and DE."],
    pt: ["Pontua os meus últimos 50 leads por intenção.", "Cria um lead magnet para founders SaaS na Alemanha.", "Qual canal trouxe os melhores leads esta semana?", "Faz uma sequência de nutrição em 3 passos em PT e DE."],
    es: ["Puntúa mis últimos 50 leads por intención.", "Crea un lead magnet para founders SaaS en Alemania.", "¿Qué canal trajo los mejores leads esta semana?", "Redacta una secuencia de nurture en 3 pasos en ES y DE."],
    fr: ["Note mes 50 derniers leads par intention.", "Crée un lead magnet pour les fondateurs SaaS allemands.", "Quel canal apporte les meilleurs leads cette semaine ?", "Rédige un nurture en 3 étapes en FR et DE."],
    de: ["Bewerte meine letzten 50 Leads nach Intention.", "Erstelle einen Lead Magnet für SaaS-Gründer in DE.", "Welcher Kanal bringt diese Woche die besten Leads?", "Entwirf eine 3-stufige Nurture in DE und EN."],
    it: ["Valuta i miei ultimi 50 lead per intenzione.", "Crea un lead magnet per fondatori SaaS in Germania.", "Quale canale porta i lead migliori questa settimana?", "Scrivi una nurture in 3 step in IT e DE."],
  },
  reach: {
    en: ["Find 10 European newsletters for sponsorships.", "Plan a 2-week organic LinkedIn rollout.", "How is my organic reach trending vs last month?", "5 viral TikTok hooks in my niche."],
    pt: ["Encontra 10 newsletters europeias para patrocínio.", "Planeia um rollout orgânico LinkedIn de 2 semanas.", "Como vai o meu alcance orgânico vs mês passado?", "5 hooks virais TikTok no meu nicho."],
    es: ["Encuentra 10 newsletters europeas para patrocinios.", "Planifica un rollout orgánico de LinkedIn de 2 semanas.", "¿Cómo va mi alcance orgánico vs el mes pasado?", "5 hooks virales de TikTok para mi nicho."],
    fr: ["Trouve 10 newsletters européennes pour des sponsoring.", "Planifie un déploiement organique LinkedIn de 2 semaines.", "Comment évolue ma portée organique vs le mois dernier ?", "5 hooks viraux TikTok pour mon créneau."],
    de: ["Finde 10 europäische Newsletter für Sponsorings.", "Plane einen 2-wöchigen organischen LinkedIn-Rollout.", "Wie entwickelt sich meine organische Reichweite vs Vormonat?", "5 virale TikTok-Hooks für meine Nische."],
    it: ["Trova 10 newsletter europee per sponsorizzazioni.", "Pianifica un rollout organico LinkedIn di 2 settimane.", "Come va la mia reach organica vs il mese scorso?", "5 hook virali TikTok per la mia nicchia."],
  },
  brand: {
    en: ["Audit my brand voice in 3 bullets.", "Write a tagline in EN, PT, DE, FR.", "Are my campaigns consistent with my tone?", "30-day content pillar plan."],
    pt: ["Audita o meu tom de marca em 3 pontos.", "Escreve um tagline em EN, PT, DE, FR.", "As minhas campanhas estão consistentes com o tom?", "Plano de pilares de conteúdo de 30 dias."],
    es: ["Audita mi voz de marca en 3 puntos.", "Escribe un tagline en EN, ES, DE, FR.", "¿Mis campañas son consistentes con mi tono?", "Plan de pilares de contenido a 30 días."],
    fr: ["Audite ma voix de marque en 3 points.", "Écris un tagline en EN, FR, DE, ES.", "Mes campagnes sont-elles cohérentes ?", "Plan de piliers contenu sur 30 jours."],
    de: ["Audit meiner Markenstimme in 3 Punkten.", "Tagline in DE, EN, FR, IT.", "Sind meine Kampagnen tonal konsistent?", "30-Tage Content-Pillar-Plan."],
    it: ["Audit della mia voce di brand in 3 punti.", "Tagline in IT, EN, DE, FR.", "Le mie campagne sono coerenti col tono?", "Piano pilastri contenuti 30 giorni."],
  },
  reports: {
    en: ["Give me today's 3-hour pulse on every channel.", "Compare this week vs last week.", "Which KPI needs my attention now?", "Export a 1-page executive brief."],
    pt: ["Dá-me o pulso de 3h de hoje em cada canal.", "Compara esta semana vs a semana passada.", "Que KPI precisa de atenção agora?", "Exporta um brief executivo de 1 página."],
    es: ["Dame el pulso de 3h de hoy en cada canal.", "Compara esta semana vs la pasada.", "¿Qué KPI necesita atención ahora?", "Exporta un brief ejecutivo de 1 página."],
    fr: ["Donne-moi le pulse 3h d'aujourd'hui par canal.", "Compare cette semaine vs la précédente.", "Quel KPI demande mon attention ?", "Exporte un brief exécutif d'une page."],
    de: ["Gib mir den 3h-Puls von heute pro Kanal.", "Vergleiche diese Woche mit der letzten.", "Welcher KPI braucht jetzt Aufmerksamkeit?", "Exportiere ein einseitiges Executive Brief."],
    it: ["Dammi il pulse 3h di oggi per canale.", "Confronta questa settimana vs la scorsa.", "Quale KPI richiede attenzione ora?", "Esporta un brief esecutivo di 1 pagina."],
  },
};

type Msg = { role: "user" | "assistant"; content: string };

function AgentChat() {
  const { slug } = useParams({ from: "/_authenticated/dashboard/agents/$slug" });
  const { t, lang } = useI18n();
  const send = useServerFn(sendAgentMessage);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [cost, setCost] = useState(2);
  const scrollRef = useRef<HTMLDivElement>(null);

  const Icon = ICONS[slug] ?? Square;
  const presets = PRESETS[slug]?.[lang] ?? PRESETS[slug]?.en ?? [];
  const agentNameLocalized = t(`agents.${slug}.name`);

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
      const res = await send({ data: { conversationId: conversationId ?? undefined, agentSlug: slug, message: text, language: lang } });
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

  const displayName = agentNameLocalized || agentName;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
      <header className="h-14 md:h-16 border-b border-brand-border px-4 md:px-8 flex items-center gap-3 shrink-0">
        <div className="size-8 bg-brand-surface ring-1 ring-brand-border rounded-lg flex items-center justify-center">
          <Icon className="size-4 text-neon" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{displayName}</div>
          <div className="text-[10px] uppercase tracking-widest text-brand-muted">
            {t("dash.cost")} {cost} {t("dash.credits.unit")}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neon/80 px-2.5 py-1 rounded-md ring-1 ring-neon/30 bg-neon/5">
          <Activity className="size-3 animate-pulse" /> {t("chat.live")}
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
                <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight mb-2">{t("chat.empty.title")}</h2>
                <p className="text-sm text-brand-muted max-w-md mx-auto">{t("chat.empty.desc")}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-brand-muted px-2.5 py-1 rounded-md ring-1 ring-brand-border bg-brand-surface">
                  <Clock className="size-3" /> {t("chat.empty.pulse")}
                </div>
              </div>

              {presets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-muted mb-3">
                    <Sparkles className="size-3 text-neon" /> {t("chat.presets")}
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
