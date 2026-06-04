import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen, Sparkles, Target, BarChart3, Plug, GitBranch, GraduationCap,
  CheckCircle2, ChevronLeft, ChevronRight, X, PlayCircle, Megaphone, Users,
  Globe, Square, FileText, Coins,
} from "lucide-react";
import { useI18n, type LangCode } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/academy")({
  head: () => ({ meta: [{ title: "Academy — Aurevia" }] }),
  component: Academy,
});

type Slide = {
  icon: typeof Sparkles;
  title: string;
  body: string;
  bullets?: string[];
  tip?: string;
};

type Module = {
  id: string;
  icon: typeof Sparkles;
  level: string;
  title: string;
  summary: string;
  slides: Slide[];
};

// Per-language module catalog. EN is canonical; PT included; others fall back to EN.
function buildModules(lang: LangCode): Module[] {
  const en: Module[] = [
    {
      id: "start", icon: Sparkles, level: "Foundations",
      title: "Welcome to Aurevia",
      summary: "What the platform is, how it thinks, and how to get value in your first hour.",
      slides: [
        { icon: Sparkles, title: "Aurevia in one sentence", body: "Aurevia is a marketing agency operated by 5 autonomous AI agents that you direct by chat — across every European market.", bullets: ["Ads, Leads, Reach, Brand, Reports", "Native in 6 EU languages", "GDPR by default"] },
        { icon: Coins, title: "How credits work", body: "Every action an agent takes costs credits — a message, a campaign edit, a report. You start with 100 free credits.", bullets: ["1 message ≈ 1–3 credits", "Top up anytime in Billing", "Credits never expire on paid plans"] },
        { icon: GraduationCap, title: "Your first hour", body: "Connect 1 integration, talk to the Ads Agent, and let the Reports Agent post its first 3h pulse.", tip: "Start with Meta Ads + GA4 — that's enough for the Ads Agent to read live data." },
      ],
    },
    {
      id: "agents", icon: Megaphone, level: "Agents",
      title: "Meet the 5 agents",
      summary: "What each agent does best, when to call it, and how they collaborate.",
      slides: [
        { icon: Megaphone, title: "Ads Agent", body: "Launches and optimizes paid campaigns across Meta, Google, TikTok and BidMachine.", bullets: ["Bid + budget reallocation", "Creative angle generation", "ROAS guardrails"] },
        { icon: Users, title: "Leads Agent", body: "Scores prospects by intent and drafts personalized outreach in the language of your market.", bullets: ["Lead scoring 0–100", "Multilingual nurture sequences", "Channel-quality benchmarks"] },
        { icon: Globe, title: "Reach Agent", body: "Plans organic distribution: newsletter sponsorships, LinkedIn rollouts, TikTok hooks.", bullets: ["Sponsor list research", "Organic reach trend", "Viral hook generation"] },
        { icon: Square, title: "Brand Agent", body: "Audits tone, generates taglines and keeps every campaign on-brand.", bullets: ["Brand voice audit", "Multilingual taglines", "Content pillar plans"] },
        { icon: FileText, title: "Reports Agent", body: "Synthesizes raw data into a 3-hour pulse and 1-page executive briefs.", bullets: ["3h pulse on every channel", "Week-over-week comparisons", "Board-ready exports"] },
      ],
    },
    {
      id: "integrations", icon: Plug, level: "Setup",
      title: "Connect your channels",
      summary: "Six integrations covered, what each unlocks, and how to test the connection.",
      slides: [
        { icon: Plug, title: "The 6 integrations", body: "Meta Ads, Meta Business Suite, Google Ads, Google Analytics 4, TikTok Ads, BidMachine.", tip: "You don't need all 6. Start with the ones where you already spend." },
        { icon: Target, title: "What each unlocks", body: "Ad networks give the Ads Agent write access; GA4 gives every agent attribution data; Business Suite lets the Brand Agent post.", bullets: ["Meta/Google/TikTok → campaigns", "GA4 → conversions + attribution", "BidMachine → programmatic RTB"] },
        { icon: CheckCircle2, title: "Verify it worked", body: "Open the Ads Agent chat and ask: \"List my active campaigns on Meta.\" If you see them, you're live.", tip: "Tokens are encrypted and revocable at any time from Integrations." },
      ],
    },
    {
      id: "campaigns", icon: Target, level: "Operate",
      title: "Launch a campaign by prompt",
      summary: "How to brief the Ads Agent so it ships campaigns you'd be proud of.",
      slides: [
        { icon: Sparkles, title: "Anatomy of a great brief", body: "Goal + audience + budget + market + 1 constraint. That's it.", bullets: ["\"Sell €49 leather wallets\"", "\"EU women 28–45 interested in slow fashion\"", "\"€30/day for 7 days\"", "\"Don't bid on competitor terms\""] },
        { icon: Megaphone, title: "Approve before going live", body: "The agent proposes ad sets and creatives in chat. You approve with a single \"go live\" before any spend happens." },
        { icon: BarChart3, title: "Monitor with the 3h pulse", body: "Ask \"How's the campaign?\" any time. The Reports Agent posts a structured pulse every 3 hours automatically.", tip: "Reply to a pulse with \"pause the worst ad set\" and the Ads Agent acts immediately." },
      ],
    },
    {
      id: "funnels", icon: GitBranch, level: "Strategy",
      title: "Design funnel boards",
      summary: "Create named funnels per project. Agents fill each stage with assets.",
      slides: [
        { icon: GitBranch, title: "Funnels = projects", body: "One funnel per launch, product or market. Name them like \"Q4 — France\" or \"DACH Lead Gen\"." },
        { icon: Target, title: "The 4 default stages", body: "Awareness, Consideration, Conversion, Retention. You can rename or add stages." },
        { icon: Sparkles, title: "Let agents fill the stages", body: "Tell the Brand Agent \"fill Awareness for Q4 — France with 3 ad concepts\" and assets appear on the board.", tip: "Funnels survive across conversations — they're your single source of truth." },
      ],
    },
    {
      id: "reports", icon: BarChart3, level: "Insights",
      title: "Read the 3-hour pulse",
      summary: "Decode what the Reports Agent is telling you, fast.",
      slides: [
        { icon: BarChart3, title: "ROAS, CPL, CAC at a glance", body: "Every pulse leads with the 3 numbers that matter and flags any 20%+ swing in red or green." },
        { icon: Sparkles, title: "Ask follow-ups", body: "\"Why did CPL spike?\" — the Reports Agent will trace it back to ad set, audience or creative." },
        { icon: FileText, title: "Export an executive brief", body: "\"Give me a 1-page brief for my board\" — you get markdown ready to paste into a deck.", tip: "Schedule weekly briefs by asking once: \"Send me this brief every Monday 9am.\"" },
      ],
    },
    {
      id: "billing", icon: Coins, level: "Account",
      title: "Plans & credits",
      summary: "Pick the right plan and learn how to stretch your credits.",
      slides: [
        { icon: Coins, title: "Three plans, fair prices", body: "Starter €19 / 500 credits. Growth €59 / 2,500 credits. Scale €199 / 12,000 credits.", bullets: ["No contracts", "Credits never expire on paid plans", "Top up anytime"] },
        { icon: CheckCircle2, title: "How to stretch credits", body: "Use presets, ask short follow-ups, and let the Reports Agent batch updates instead of re-asking every channel.", tip: "Most operators spend 50–300 credits per active day." },
      ],
    },
  ];

  const pt: Module[] = [
    {
      id: "start", icon: Sparkles, level: "Fundamentos",
      title: "Bem-vindo à Aurevia",
      summary: "O que é a plataforma, como pensa, e como ter valor na primeira hora.",
      slides: [
        { icon: Sparkles, title: "Aurevia em uma frase", body: "A Aurevia é uma agência de marketing operada por 5 agentes de IA autónomos que você comanda por chat — em todos os mercados europeus.", bullets: ["Ads, Leads, Alcance, Marca, Relatórios", "Nativa em 6 idiomas da UE", "GDPR por defeito"] },
        { icon: Coins, title: "Como funcionam os créditos", body: "Cada ação de um agente custa créditos — uma mensagem, uma edição de campanha, um relatório. Começa com 100 créditos grátis.", bullets: ["1 mensagem ≈ 1–3 créditos", "Recarregue em Faturação", "Créditos nunca expiram em planos pagos"] },
        { icon: GraduationCap, title: "A sua primeira hora", body: "Conecte 1 integração, fale com o Agente de Ads e deixe o Agente de Relatórios postar o primeiro pulso de 3h.", tip: "Comece com Meta Ads + GA4 — chega para o Agente de Ads ler dados ao vivo." },
      ],
    },
    {
      id: "agents", icon: Megaphone, level: "Agentes",
      title: "Conheça os 5 agentes",
      summary: "O que cada agente faz melhor, quando chamar, e como colaboram.",
      slides: [
        { icon: Megaphone, title: "Agente de Ads", body: "Lança e otimiza campanhas pagas em Meta, Google, TikTok e BidMachine.", bullets: ["Realocação de lance + orçamento", "Geração de ângulos criativos", "Guardrails de ROAS"] },
        { icon: Users, title: "Agente de Leads", body: "Pontua prospects por intenção e redige outreach personalizado no idioma do seu mercado.", bullets: ["Scoring de 0 a 100", "Sequências multilingue", "Benchmarks por canal"] },
        { icon: Globe, title: "Agente de Alcance", body: "Planeia distribuição orgânica: patrocínio de newsletters, rollout LinkedIn, hooks TikTok.", bullets: ["Investigação de patrocinadores", "Tendência de alcance orgânico", "Geração de hooks virais"] },
        { icon: Square, title: "Agente de Marca", body: "Audita tom, gera taglines e mantém cada campanha on-brand.", bullets: ["Auditoria de voz", "Taglines multilingue", "Plano de pilares de conteúdo"] },
        { icon: FileText, title: "Agente de Relatórios", body: "Sintetiza dados em pulso de 3h e briefings executivos de 1 página.", bullets: ["Pulso de 3h em cada canal", "Comparação semana vs semana", "Exportações para board"] },
      ],
    },
    {
      id: "integrations", icon: Plug, level: "Setup",
      title: "Conecte os seus canais",
      summary: "Seis integrações cobertas, o que cada uma desbloqueia, e como testar.",
      slides: [
        { icon: Plug, title: "As 6 integrações", body: "Meta Ads, Meta Business Suite, Google Ads, Google Analytics 4, TikTok Ads, BidMachine.", tip: "Não precisa de todas. Comece pelas onde já investe." },
        { icon: Target, title: "O que cada uma desbloqueia", body: "Redes de ads dão escrita ao Agente de Ads; GA4 dá atribuição a todos; Business Suite permite postar.", bullets: ["Meta/Google/TikTok → campanhas", "GA4 → conversões + atribuição", "BidMachine → RTB programático"] },
        { icon: CheckCircle2, title: "Verifique que funcionou", body: "Abra o Agente de Ads e pergunte: \"Lista as minhas campanhas ativas no Meta.\" Se aparecerem, está live.", tip: "Tokens são encriptados e revogáveis a qualquer momento." },
      ],
    },
    {
      id: "campaigns", icon: Target, level: "Operar",
      title: "Lance uma campanha por prompt",
      summary: "Como dar briefing ao Agente de Ads para ele lançar campanhas das quais se orgulha.",
      slides: [
        { icon: Sparkles, title: "Anatomia de um bom brief", body: "Objetivo + audiência + orçamento + mercado + 1 restrição. Só isso.", bullets: ["\"Vender carteiras de pele €49\"", "\"Mulheres UE 28–45 em moda lenta\"", "\"€30/dia por 7 dias\"", "\"Não fazer bid em termos de concorrentes\""] },
        { icon: Megaphone, title: "Aprove antes de ir live", body: "O agente propõe ad sets e criativos no chat. Aprove com um \"go live\" antes de qualquer gasto." },
        { icon: BarChart3, title: "Monitore com o pulso de 3h", body: "Pergunte \"Como está a campanha?\" a qualquer momento. O Agente de Relatórios posta um pulso estruturado a cada 3h.", tip: "Responda ao pulso com \"pausa o pior ad set\" e o Agente de Ads age na hora." },
      ],
    },
    {
      id: "funnels", icon: GitBranch, level: "Estratégia",
      title: "Desenhe boards de funil",
      summary: "Crie funis nomeados por projeto. Os agentes preenchem cada etapa com ativos.",
      slides: [
        { icon: GitBranch, title: "Funis = projetos", body: "Um funil por lançamento, produto ou mercado. Nomeie como \"Q4 — França\" ou \"DACH Lead Gen\"." },
        { icon: Target, title: "As 4 etapas padrão", body: "Awareness, Consideração, Conversão, Retenção. Renomeie ou adicione etapas." },
        { icon: Sparkles, title: "Deixe os agentes preencher", body: "Diga ao Agente de Marca \"preenche Awareness para Q4 — França com 3 conceitos de ad\" e os ativos aparecem.", tip: "Os funis sobrevivem entre conversas — são a sua fonte única de verdade." },
      ],
    },
    {
      id: "reports", icon: BarChart3, level: "Insights",
      title: "Leia o pulso de 3 horas",
      summary: "Descodifique rapidamente o que o Agente de Relatórios está a dizer.",
      slides: [
        { icon: BarChart3, title: "ROAS, CPL, CAC à vista", body: "Cada pulso lidera com os 3 números que importam e sinaliza variações de 20%+ a vermelho ou verde." },
        { icon: Sparkles, title: "Faça follow-ups", body: "\"Porque é que o CPL subiu?\" — o Agente de Relatórios rastreia até ad set, audiência ou criativo." },
        { icon: FileText, title: "Exporte um brief executivo", body: "\"Dá-me um brief de 1 página para o board\" — recebe markdown pronto para colar num deck.", tip: "Agende briefs semanais com um pedido único: \"Manda este brief toda segunda às 9h.\"" },
      ],
    },
    {
      id: "billing", icon: Coins, level: "Conta",
      title: "Planos e créditos",
      summary: "Escolha o plano certo e aprenda a esticar os créditos.",
      slides: [
        { icon: Coins, title: "Três planos, preços justos", body: "Inicial €19 / 500 créditos. Crescimento €59 / 2.500 créditos. Escala €199 / 12.000 créditos.", bullets: ["Sem contratos", "Créditos não expiram em planos pagos", "Recarregue a qualquer momento"] },
        { icon: CheckCircle2, title: "Como esticar os créditos", body: "Use presets, faça follow-ups curtos, e deixe o Agente de Relatórios agrupar updates em vez de perguntar canal a canal.", tip: "A maioria gasta 50–300 créditos por dia ativo." },
      ],
    },
  ];

  return lang === "pt" ? pt : en;
}

function Academy() {
  const { t, lang } = useI18n();
  const modules = buildModules(lang);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [openModule, setOpenModule] = useState<Module | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const completed = Object.values(done).filter(Boolean).length;

  useEffect(() => { setSlideIdx(0); }, [openModule]);

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neon mb-3">
          <BookOpen className="size-3" /> {t("aca.tag")}
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight mb-3">{t("aca.title")}</h1>
        <p className="text-sm md:text-base text-brand-muted max-w-2xl">{t("aca.subtitle")}</p>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 max-w-xs h-1.5 rounded-full bg-brand-surface overflow-hidden">
            <div
              className="h-full bg-neon transition-all duration-500"
              style={{ width: `${(completed / modules.length) * 100}%`, boxShadow: "0 0 12px var(--neon)" }}
            />
          </div>
          <span className="text-xs text-brand-muted">{completed}/{modules.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          const isDone = !!done[m.id];
          return (
            <article
              key={m.id}
              className="group p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/50 transition-all hover:shadow-[0_0_30px_-12px_var(--neon)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="size-10 rounded-xl bg-brand-bg ring-1 ring-brand-border flex items-center justify-center group-hover:ring-neon/40 transition">
                  <Icon className="size-4 text-neon" />
                </div>
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-brand-muted">
                  <span>{m.slides.length} slides</span>
                  <span>{m.level}</span>
                </div>
              </div>
              <h3 className="font-heading text-lg font-medium tracking-tight mb-2">{m.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed mb-5">{m.summary}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setOpenModule(m)} className="btn-neon text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
                  <PlayCircle className="size-3.5" /> {t("aca.start")}
                </button>
                <button
                  onClick={() => setDone((d) => ({ ...d, [m.id]: !d[m.id] }))}
                  className={
                    "text-xs px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition " +
                    (isDone ? "bg-neon/15 text-neon ring-1 ring-neon/50" : "btn-dark")
                  }
                >
                  <CheckCircle2 className="size-3.5" /> {isDone ? "✓" : "Mark"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Slide viewer */}
      {openModule && (
        <SlideViewer
          module={openModule}
          slideIdx={slideIdx}
          setSlideIdx={setSlideIdx}
          onClose={() => setOpenModule(null)}
          onComplete={() => { setDone((d) => ({ ...d, [openModule.id]: true })); setOpenModule(null); }}
          t={t}
        />
      )}
    </div>
  );
}

function SlideViewer({
  module: m, slideIdx, setSlideIdx, onClose, onComplete, t,
}: {
  module: Module; slideIdx: number; setSlideIdx: (n: number) => void;
  onClose: () => void; onComplete: () => void; t: (k: string) => string;
}) {
  const slide = m.slides[slideIdx];
  const Icon = slide.icon;
  const isLast = slideIdx === m.slides.length - 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && slideIdx < m.slides.length - 1) setSlideIdx(slideIdx + 1);
      if (e.key === "ArrowLeft" && slideIdx > 0) setSlideIdx(slideIdx - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slideIdx, m.slides.length, onClose, setSlideIdx]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in">
      <button onClick={onClose} className="absolute top-4 right-4 btn-dark p-2 z-10" aria-label={t("aca.close")}>
        <X className="size-4" />
      </button>

      <div className="w-full max-w-3xl">
        {/* Slide */}
        <div className="relative aspect-[16/10] rounded-3xl bg-brand-surface ring-1 ring-neon/30 shadow-[0_0_80px_-20px_var(--neon)] overflow-hidden p-8 md:p-12 flex flex-col animate-in fade-in zoom-in-95 duration-300" key={slideIdx}>
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(var(--neon) 1px, transparent 1px), linear-gradient(90deg, var(--neon) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute top-6 left-6 text-[10px] uppercase tracking-widest text-brand-muted">
            {m.title}
          </div>
          <div className="absolute top-6 right-6 text-[10px] uppercase tracking-widest text-neon">
            {t("aca.slide")} {slideIdx + 1} {t("aca.of")} {m.slides.length}
          </div>

          <div className="relative flex-1 flex flex-col justify-center max-w-xl">
            <div className="size-12 rounded-xl bg-brand-bg ring-1 ring-neon/40 flex items-center justify-center mb-5 shadow-[0_0_24px_-8px_var(--neon)]">
              <Icon className="size-5 text-neon" />
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-medium tracking-tight mb-4 text-balance">{slide.title}</h3>
            <p className="text-sm md:text-base text-brand-muted leading-relaxed mb-5">{slide.body}</p>
            {slide.bullets && (
              <ul className="space-y-2 mb-4">
                {slide.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-brand-text">
                    <span className="mt-1.5 size-1.5 rounded-full bg-neon shrink-0 shadow-[0_0_6px_var(--neon)]" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {slide.tip && (
              <div className="mt-3 px-4 py-2.5 rounded-lg bg-neon/10 ring-1 ring-neon/30 text-xs text-neon">
                💡 {slide.tip}
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div className="relative flex items-center justify-center gap-1.5 mt-4">
            {m.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (i === slideIdx ? "w-6 bg-neon shadow-[0_0_8px_var(--neon)]" : "w-1.5 bg-brand-border hover:bg-brand-muted")
                }
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setSlideIdx(Math.max(0, slideIdx - 1))}
            disabled={slideIdx === 0}
            className="btn-dark text-xs px-3 py-2 inline-flex items-center gap-1.5 disabled:opacity-30"
          >
            <ChevronLeft className="size-3.5" /> {t("aca.prev")}
          </button>
          {isLast ? (
            <button onClick={onComplete} className="btn-neon-solid text-xs px-4 py-2 inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> ✓
            </button>
          ) : (
            <button
              onClick={() => setSlideIdx(slideIdx + 1)}
              className="btn-neon text-xs px-3 py-2 inline-flex items-center gap-1.5"
            >
              {t("aca.next")} <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
