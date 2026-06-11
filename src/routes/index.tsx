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
    <div className="relative min-h-screen bg-brand-bg text-brand-text flex flex-col overflow-x-hidden">
      {/* Ambient orbs de fundo */}
      <div className="hero-orb" />
      <div className="chat-wave-bg absolute inset-0 pointer-events-none" />
      
      {/* Dot grid overlay sutil */}
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-20" />

      <header className="relative z-20 shrink-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <BrandMark size={24} />
            <span className="text-sm font-medium tracking-tight bg-gradient-to-r from-brand-text to-brand-muted bg-clip-text text-transparent group-hover:to-brand-text transition-all duration-300">
              algoria
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            {authed ? (
              <Link to="/dashboard/chat" className="btn-neon-solid text-xs px-3 py-1.5 rounded-lg">
                {t("nav.open") || "Abrir app"}
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-xs px-2.5 py-1.5 text-brand-muted hover:text-neon transition-colors duration-200">
                  {t("nav.signin")}
                </Link>
                <Link to="/auth" className="btn-neon-solid text-xs px-3 py-1.5 rounded-lg">
                  {copy.signup}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 gap-8 min-h-0">
        {/* Rotating chat-style headline */}
        <div className="w-full max-w-2xl text-center fade-up">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-brand-border bg-brand-surface/60 backdrop-blur text-[10px] text-brand-muted mb-5 neon-pulse">
            <Sparkles className="size-3 text-neon" /> 
            <span>{copy.badge}</span>
          </div>
          
          <div className="h-[3.5rem] md:h-[4.5rem] flex items-center justify-center mb-4 overflow-hidden">
            <h1
              key={phraseIdx}
              className="text-2xl md:text-4xl font-medium tracking-tight text-balance gradient-text animate-fade-in"
            >
              {phrases[phraseIdx]}
            </h1>
          </div>
          
          <div className="flex justify-center gap-1.5 mb-5">
            {phrases.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === phraseIdx 
                    ? "w-6 bg-neon" 
                    : "w-1 bg-brand-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Composer - Glass card style */}
        <form
          onSubmit={(e) => { e.preventDefault(); go(input); }}
          className="w-full max-w-xl fade-up-1"
        >
          <div className="glass-card p-0 overflow-hidden focus-within:ring-neon transition-all duration-300">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(input); } }}
                rows={2}
                placeholder={copy.placeholder}
                className="w-full bg-transparent rounded-2xl px-4 py-3 pr-14 text-sm resize-none focus:outline-none placeholder:text-brand-muted/70"
              />
              <button
                type="submit"
                className="absolute bottom-2.5 right-2.5 size-9 rounded-full btn-neon-solid flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                aria-label="Send"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Apps strip */}
        <div className="w-full max-w-xl fade-up-2">
          <div className="text-[10px] uppercase tracking-widest text-brand-muted text-center mb-3 font-medium">
            {copy.apps}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {APPS.map((app, idx) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.name}
                  className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-brand-surface/70 border border-brand-border text-[11px] text-brand-muted hover:border-neon/50 hover:bg-brand-surface transition-all duration-200 cursor-default"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <Icon className="size-3.5 transition-transform group-hover:scale-110" style={{ color: app.color }} />
                  <span className="group-hover:text-brand-text transition-colors">{app.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute bottom-8 left-8 opacity-30 pointer-events-none">
          <div className="particle-ring w-32 h-32" />
        </div>
        <div className="absolute top-32 right-8 opacity-20 pointer-events-none">
          <div className="particle-ring w-48 h-48" style={{ animationDuration: "4.5s" }} />
        </div>
      </main>

      <CookieBanner />
    </div>
  );
}
