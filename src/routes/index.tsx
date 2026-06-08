import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, ArrowUp, Globe } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { CookieBanner } from "@/components/site/CookieBanner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurevia — AI marketing co-pilot" },
      { name: "description", content: "Launch campaigns by prompt with autonomous AI marketing agents. Free 50 credits to start." },
      { property: "og:title", content: "Aurevia — AI marketing co-pilot" },
      { property: "og:description", content: "Talk to AI agents that run your ads, leads and brand." },
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
      try { sessionStorage.setItem("aurevia.pendingPrompt", text); } catch { /* ignore */ }
    }
    if (authed) navigate({ to: "/dashboard/chat" });
    else navigate({ to: "/auth" });
  }

  const suggestions = [
    t("home.s1") || "Launch a Meta Ads campaign, €25/day, DACH founders.",
    t("home.s2") || "Score my last 50 leads by buying intent.",
    t("home.s3") || "Give me a 3-hour performance pulse.",
    t("home.s4") || "Plan a 3-week reach push for Spain + Italy, €1,800.",
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      {/* Top-right minimal header */}
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="font-heading text-base font-medium tracking-tight">Aurevia</span>
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

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-24 relative">
        {/* Decorative neon glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--neon) 18%, transparent), transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        <div className="relative w-full max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 ring-neon/30 bg-neon/5 text-[11px] text-neon mb-7">
            <Sparkles className="size-3" />
            {t("home.badge") || "50 free credits on signup · 5 daily"}
          </div>

          <h1 className="font-heading text-4xl md:text-6xl font-medium leading-[1.05] tracking-tight text-balance mb-5">
            {t("home.title") || "What do you want to launch today?"}
          </h1>
          <p className="text-sm md:text-base text-brand-muted max-w-xl mx-auto mb-9">
            {t("home.subtitle") || "Talk to autonomous AI marketing agents. They run ads, score leads and report back — by prompt."}
          </p>

          {/* Chat-style input */}
          <form
            onSubmit={(e) => { e.preventDefault(); go(input); }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative rounded-3xl ring-1 ring-brand-border bg-brand-surface focus-within:ring-neon/60 transition-all shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(input); } }}
                rows={3}
                placeholder={t("home.placeholder") || "Ask Aurevia to launch a campaign, score leads, anything…"}
                className="w-full bg-transparent rounded-3xl px-5 py-4 pb-14 text-sm md:text-base resize-none focus:outline-none placeholder:text-brand-muted/70"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] text-brand-muted inline-flex items-center gap-1.5">
                  <Globe className="size-3" /> {t("home.private") || "Private · GDPR-native"}
                </span>
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

          {/* Suggestion chips */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => go(s)}
                className="text-xs px-3 py-1.5 rounded-full ring-1 ring-brand-border bg-brand-surface hover:ring-neon/40 hover:text-neon transition text-brand-muted"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-12 text-[11px] uppercase tracking-widest text-brand-muted">
            {t("home.foot") || "Free to start · No credit card · Cancel anytime"}
          </div>
        </div>
      </main>

      <CookieBanner />
    </div>
  );
}
