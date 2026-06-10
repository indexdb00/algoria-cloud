import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { CookieBanner } from "@/components/site/CookieBanner";
import { supabase } from "@/integrations/supabase/client";
import { PlanCarousel } from "@/components/PlanCarousel";
import { IntegrationStrip } from "@/components/IntegrationStrip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Algoria — Find the right algorithm for every audience" },
      { name: "description", content: "Algoria uses AI to find the precise algorithm that reaches your target audience with maximum efficiency." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  function go(prompt: string) {
    const text = prompt.trim();
    if (text) {
      try { sessionStorage.setItem("algoria.pendingPrompt", text); } catch { /* ignore */ }
    }
    if (authed) navigate({ to: "/dashboard/chat" });
    else navigate({ to: "/auth" });
  }

  const pitches = [
    { title: t("home.pitch1.t") || "The right algorithm", desc: t("home.pitch1.d") || "Pinpoint the exact reach for your audience." },
    { title: t("home.pitch2.t") || "Autonomous agents", desc: t("home.pitch2.d") || "AI that launches, optimizes and reports back." },
    { title: t("home.pitch3.t") || "Results in minutes", desc: t("home.pitch3.d") || "From prompt to performance, end to end." },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col chat-wave-bg">
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="font-heading text-base font-medium tracking-tight">Algoria</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            {authed ? (
              <Link to="/dashboard/chat" className="btn-neon-solid text-xs px-3.5 py-2 rounded-lg">
                {t("nav.open") || "Open app"}
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-xs px-3 py-2 text-brand-muted hover:text-brand-text transition">
                  {t("nav.signin")}
                </Link>
                <Link to="/auth" className="btn-neon-solid text-xs px-3.5 py-2 rounded-lg">
                  {t("home.signup") || "Get started"}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pt-28 pb-16 relative gap-14">
        <div className="relative w-full max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neon-border bg-neon/5 text-[11px] neon-text mb-7">
            <Sparkles className="size-3" />
            {t("home.badge") || "100 free credits on signup · 5 daily"}
          </div>

          <h1 className="font-heading text-4xl md:text-6xl font-medium leading-[1.05] tracking-tight text-balance mb-5">
            {t("home.title") || "What do you want to launch today?"}
          </h1>
          <p className="text-sm md:text-base text-brand-muted max-w-xl mx-auto mb-9">
            {t("home.subtitle") || "Find the right algorithm for every audience — with autonomous AI agents."}
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); go(input); }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative rounded-3xl neon-border bg-brand-surface focus-within:shadow-[0_0_0_2px_var(--neon)] transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(input); } }}
                rows={3}
                placeholder={t("home.placeholder") || "Ask Algoria anything…"}
                className="w-full bg-transparent rounded-3xl px-5 py-4 pb-14 text-sm md:text-base resize-none focus:outline-none placeholder:text-brand-muted/70"
              />
              <div className="absolute bottom-3 right-3">
                <button
                  type="submit"
                  className="size-10 rounded-full btn-neon-solid flex items-center justify-center"
                  aria-label="Send"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Pitches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl w-full">
          {pitches.map((p) => (
            <div key={p.title} className="p-4 rounded-2xl bg-brand-surface/70 ring-1 ring-brand-border hover:neon-border transition">
              <div className="font-heading text-sm font-medium mb-1 neon-text">{p.title}</div>
              <div className="text-xs text-brand-muted leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Plans carousel */}
        <div className="w-full">
          <div className="text-center mb-4">
            <div className="text-[10px] uppercase tracking-widest neon-text mb-1">{t("home.plansTag") || "Plans"}</div>
            <div className="font-heading text-2xl font-medium tracking-tight">{t("home.plansTitle") || "Simple credit-based pricing"}</div>
          </div>
          <PlanCarousel />
        </div>

        {/* Integrations */}
        <IntegrationStrip />
      </main>

      <CookieBanner />
    </div>
  );
}
