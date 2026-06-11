import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle, Video, Users, Hash, Tv, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { CookieBanner } from "@/components/site/CookieBanner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Algoria — Algoritmo certo para cada audiência" },
      { name: "description", content: "Algoria encontra o algoritmo exato para alcançar seu público com inteligência e eficiência." },
    ],
  }),
  component: Home,
});

const APPS = [
  { name: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  { name: "Meet", icon: Video, color: "#00897B" },
  { name: "Teams", icon: Users, color: "#6264A7" },
  { name: "Discord", icon: Hash, color: "#5865F2" },
  { name: "Twitch", icon: Tv, color: "#9146FF" },
];

const PHRASES: Record<string, string[]> = {
  pt: [
    "Gere mais receita com IA.",
    "Encontre o algoritmo certo para o seu público.",
    "Leia a sua audiência em segundos.",
    "Lance campanhas autônomas e otimizadas.",
    "Integre WhatsApp, Meet, Teams e muito mais.",
    "Transforme prompts em performance real.",
  ],
  en: [
    "Generate more revenue with AI.",
    "Find the right algorithm for your audience.",
    "Read your audience in seconds.",
    "Launch autonomous, optimized campaigns.",
    "Integrate WhatsApp, Meet, Teams and more.",
    "Turn prompts into real performance.",
  ],
  es: [
    "Genera más ingresos con IA.",
    "Encuentra el algoritmo correcto para tu público.",
    "Lee a tu audiencia en segundos.",
    "Lanza campañas autónomas y optimizadas.",
    "Integra WhatsApp, Meet, Teams y más.",
    "Convierte prompts en rendimiento real.",
  ],
  fr: [
    "Générez plus de revenus avec l'IA.",
    "Trouvez le bon algorithme pour votre audience.",
    "Lisez votre audience en quelques secondes.",
    "Lancez des campagnes autonomes et optimisées.",
    "Intégrez WhatsApp, Meet, Teams et plus.",
    "Transformez vos prompts en performance réelle.",
  ],
  de: [
    "Erzielen Sie mehr Umsatz mit KI.",
    "Finden Sie den richtigen Algorithmus für Ihr Publikum.",
    "Lesen Sie Ihr Publikum in Sekunden.",
    "Starten Sie autonome, optimierte Kampagnen.",
    "Integrieren Sie WhatsApp, Meet, Teams und mehr.",
    "Verwandeln Sie Prompts in echte Performance.",
  ],
  it: [
    "Genera più ricavi con l'IA.",
    "Trova l'algoritmo giusto per il tuo pubblico.",
    "Leggi la tua audience in pochi secondi.",
    "Lancia campagne autonome e ottimizzate.",
    "Integra WhatsApp, Meet, Teams e altro.",
    "Trasforma i prompt in performance reale.",
  ],
};

const COPY: Record<string, { badge: string; placeholder: string; apps: string; signup: string }> = {
  pt: { badge: "100 créditos grátis no cadastro", placeholder: "Pergunte ao Algoria…", apps: "Apps integrados", signup: "Começar" },
  en: { badge: "100 free credits on signup", placeholder: "Ask Algoria anything…", apps: "Integrated apps", signup: "Get started" },
  es: { badge: "100 créditos gratis al registrarte", placeholder: "Pregunta a Algoria…", apps: "Apps integradas", signup: "Empezar" },
  fr: { badge: "100 crédits gratuits à l'inscription", placeholder: "Demandez à Algoria…", apps: "Apps intégrées", signup: "Commencer" },
  de: { badge: "100 Gratis-Credits bei Anmeldung", placeholder: "Frag Algoria…", apps: "Integrierte Apps", signup: "Loslegen" },
  it: { badge: "100 crediti gratis alla registrazione", placeholder: "Chiedi ad Algoria…", apps: "App integrate", signup: "Inizia" },
};

function Home() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const phrases = PHRASES[lang] ?? PHRASES.en;
  const copy = COPY[lang] ?? COPY.en;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setPhraseIdx((i) => (i + 1) % phrases.length), 2800);
    return () => clearInterval(id);
  }, [phrases.length]);

  function go(prompt: string) {
    const text = prompt.trim();
    if (text) {
      try { sessionStorage.setItem("algoria.pendingPrompt", text); } catch { /* ignore */ }
    }
    if (authed) navigate({ to: "/dashboard/chat" });
    else navigate({ to: "/auth" });
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-brand-bg text-brand-text flex flex-col">
      {/* subtle ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 360px at 50% 30%, color-mix(in oklab, var(--neon) 14%, transparent), transparent 70%)",
        }}
      />

      <header className="relative z-20 shrink-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandMark size={24} />
            <span className="text-sm font-medium tracking-tight">algoria</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            {authed ? (
              <Link to="/dashboard/chat" className="btn-neon-solid text-xs px-3 py-1.5 rounded-lg">
                {t("nav.open") || "Abrir app"}
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-xs px-2.5 py-1.5 text-brand-muted hover:text-brand-text transition">
                  {t("nav.signin")}
                </Link>
                <Link to="/auth" className="btn-neon-solid text-xs px-3 py-1.5 rounded-lg">
                  {t("home.signup") || "Começar"}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 gap-6 min-h-0">
        {/* Rotating chat-style headline */}
        <div className="w-full max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-brand-border bg-brand-surface/60 text-[10px] text-brand-muted mb-5">
            <Sparkles className="size-3 text-neon" /> {t("home.badge") || "100 créditos grátis no cadastro"}
          </div>
          <div className="h-[3.5rem] md:h-[4.5rem] flex items-center justify-center mb-2 overflow-hidden">
            <h1
              key={phraseIdx}
              className="text-2xl md:text-4xl font-medium tracking-tight text-balance animate-fade-in"
            >
              {phrases[phraseIdx]}
            </h1>
          </div>
          <div className="flex justify-center gap-1.5 mb-5">
            {phrases.map((_, i) => (
              <span
                key={i}
                className={
                  "h-1 rounded-full transition-all " +
                  (i === phraseIdx ? "w-6 bg-neon" : "w-1 bg-brand-border")
                }
              />
            ))}
          </div>
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => { e.preventDefault(); go(input); }}
          className="w-full max-w-xl"
        >
          <div className="relative rounded-2xl border border-brand-border bg-brand-surface/80 backdrop-blur focus-within:border-neon focus-within:shadow-[0_0_0_1px_var(--neon)] transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(input); } }}
              rows={2}
              placeholder={t("home.placeholder") || "Pergunte ao Algoria…"}
              className="w-full bg-transparent rounded-2xl px-4 py-3 pr-14 text-sm resize-none focus:outline-none placeholder:text-brand-muted/70"
            />
            <button
              type="submit"
              className="absolute bottom-2.5 right-2.5 size-9 rounded-full btn-neon-solid flex items-center justify-center"
              aria-label="Send"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </form>

        {/* Apps strip */}
        <div className="w-full max-w-xl">
          <div className="text-[10px] uppercase tracking-widest text-brand-muted text-center mb-2">
            {t("home.apps") || "Apps integrados"}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {APPS.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.name}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-brand-surface/70 border border-brand-border text-[11px] text-brand-muted"
                  title={a.name}
                >
                  <Icon className="size-3.5" style={{ color: a.color }} />
                  <span>{a.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <CookieBanner />
    </div>
  );
}
