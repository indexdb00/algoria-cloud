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

function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const phrases = [
    t("home.phrase.1") || "Gere mais receita com IA.",
    t("home.phrase.2") || "Encontre o algoritmo certo para seu público.",
    t("home.phrase.3") || "Leia sua audiência em segundos.",
    t("home.phrase.4") || "Lance campanhas autônomas e otimizadas.",
    t("home.phrase.5") || "Integre WhatsApp, Meet, Teams e mais.",
    t("home.phrase.6") || "Transforme prompts em performance real.",
  ];

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
