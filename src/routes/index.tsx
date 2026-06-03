import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Megaphone, Users, Globe, Square, FileText, Check, ArrowUpRight, Sparkles,
  Activity, Zap, ShieldCheck, GraduationCap, GitBranch, Plug,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurevia — AI marketing agents for European brands" },
      { name: "description", content: "Five autonomous AI agents — Ads, Leads, Reach, Brand, Reports — orchestrating your campaigns by prompt across European markets." },
      { property: "og:title", content: "Aurevia — AI marketing agents" },
      { property: "og:description", content: "Launch campaigns by prompt. Track them every 3 hours. Built for European brands." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  const agents = [
    { Icon: Megaphone, name: t("agents.ads.name"), desc: t("agents.ads.desc") },
    { Icon: Users, name: t("agents.leads.name"), desc: t("agents.leads.desc") },
    { Icon: Globe, name: t("agents.reach.name"), desc: t("agents.reach.desc") },
    { Icon: Square, name: t("agents.brand.name"), desc: t("agents.brand.desc") },
    { Icon: FileText, name: t("agents.reports.name"), desc: t("agents.reports.desc") },
  ];

  return (
    <div className="min-h-screen bg-brand-bg font-body text-brand-text overflow-x-hidden">
      <SiteNav />

      {/* Hero */}
      <section className="relative py-20 md:py-32">
        {/* Animated grid + glow */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--neon) 1px, transparent 1px), linear-gradient(90deg, var(--neon) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--neon) 18%, transparent), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 ring-neon/30 bg-neon/5 text-xs text-neon mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="size-1.5 rounded-full bg-neon animate-pulse shadow-[0_0_8px_var(--neon)]" />
              Live in 6 European markets
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-medium leading-[0.95] tracking-tight text-balance mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {t("hero.title")}
            </h1>
            <p className="text-base md:text-lg text-brand-muted text-pretty mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link
                to="/auth"
                className="btn-neon-solid text-sm py-2.5 px-4 inline-flex items-center gap-2 group"
              >
                <Sparkles className="size-4" />
                {t("hero.cta")}
                <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <a
                href="#agents"
                className="btn-dark text-sm py-2.5 px-4 inline-flex items-center gap-2"
              >
                Meet the agents
              </a>
            </div>

            {/* Trust strip */}
            <div className="mt-12 grid grid-cols-3 max-w-md gap-4 text-xs text-brand-muted animate-in fade-in duration-700 delay-500">
              <Stat icon={ShieldCheck} label="GDPR-native" />
              <Stat icon={Activity} label="3h pulse updates" />
              <Stat icon={Zap} label="Prompt-driven" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-2xl">
            <span className="text-[11px] uppercase tracking-widest text-neon">How it works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3">
              From prompt to performance in three steps.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step n="01" Icon={Plug} title="Connect your stack" desc="Meta, Google, BidMachine, Stripe — link them in two clicks and your agents read live data." />
            <Step n="02" Icon={Sparkles} title="Talk to an agent" desc="Describe what you want. Agents launch campaigns, score leads, or write copy from a single prompt." />
            <Step n="03" Icon={Activity} title="Get a 3h pulse" desc="Every three hours, your agents post a status update directly in chat. Ask follow-ups anytime." />
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-20 md:py-24 bg-brand-surface/50 border-y border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-neon">{t("agents.title")}</span>
              <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3 max-w-xl">
                Five specialists. One unified workspace.
              </h2>
            </div>
            <Link to="/auth" className="text-xs text-brand-muted hover:text-neon inline-flex items-center gap-1.5">
              Activate now <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {agents.map(({ Icon, name, desc }, i) => (
              <div
                key={name}
                className="group relative p-5 bg-brand-bg ring-1 ring-brand-border rounded-2xl flex flex-col justify-between h-60 hover:ring-neon/40 hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div>
                  <div className="size-9 bg-brand-surface ring-1 ring-brand-border rounded-lg flex items-center justify-center mb-4 group-hover:ring-neon/40 group-hover:shadow-[0_0_18px_-6px_var(--neon)] transition-all">
                    <Icon className="size-4 text-neon" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">{name}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">{desc}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-brand-muted">
                  <span className="flex items-center gap-1">
                    <span className="size-1 rounded-full bg-neon shadow-[0_0_6px_var(--neon)]" />
                    {t("agents.active")}
                  </span>
                  <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 group-hover:text-neon transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built-in features */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard Icon={GraduationCap} title="Academy" desc="Short modules teach you to prompt agents like a senior marketer." />
            <FeatureCard Icon={GitBranch} title="Named funnels" desc="Create unlimited funnel boards per project — your agents fill the stages." />
            <FeatureCard Icon={Plug} title="Native integrations" desc="Meta, Google Ads, BidMachine, Stripe, GA4 and TikTok in one workspace." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-24 border-t border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <span className="text-[11px] uppercase tracking-widest text-neon">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3 mb-4">{t("pricing.title")}</h2>
            <p className="text-brand-muted max-w-[48ch] mx-auto text-pretty text-sm">{t("pricing.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PricingCard tier={t("pricing.starter")} amount="500" unit={t("pricing.creditsMo")} features={[t("pricing.starter.f1"), t("pricing.starter.f2")]} cta={t("pricing.chooseStarter")} />
            <PricingCard tier={t("pricing.growth")} amount="2,000" unit={t("pricing.creditsMo")} features={[t("pricing.growth.f1"), t("pricing.growth.f2")]} cta={t("pricing.startGrowth")} featured />
            <PricingCard tier={t("pricing.scale")} amount="10,000" unit={t("pricing.creditsMo")} features={[t("pricing.scale.f1"), t("pricing.scale.f2")]} cta={t("pricing.contact")} />
          </div>
        </div>
      </section>

      {/* Case study */}
      <section id="case" className="py-20 md:py-24 border-t border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative w-full aspect-[4/3] bg-brand-surface ring-1 ring-brand-border rounded-2xl overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: "linear-gradient(var(--neon) 1px, transparent 1px), linear-gradient(90deg, var(--neon) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                opacity: 0.06,
              }} />
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                <div className="text-6xl md:text-7xl font-heading font-medium tracking-tighter text-neon" style={{ textShadow: "0 0 40px color-mix(in oklab, var(--neon) 40%, transparent)" }}>
                  412%
                </div>
                <span className="text-[10px] font-medium uppercase tracking-widest text-brand-muted">Værløse · DACH</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-widest text-neon mb-4 block">{t("case.tag")}</span>
              <h2 className="font-heading text-3xl md:text-4xl font-medium leading-tight tracking-tight text-balance mb-6">{t("case.title")}</h2>
              <p className="text-brand-muted text-pretty mb-8 text-sm md:text-base">{t("case.body")}</p>
              <div className="flex gap-10">
                <div>
                  <div className="text-3xl font-heading font-medium tracking-tight text-neon">412%</div>
                  <div className="text-xs text-brand-muted uppercase tracking-wide mt-1">{t("case.roi")}</div>
                </div>
                <div>
                  <div className="text-3xl font-heading font-medium tracking-tight">{t("case.setupVal")}</div>
                  <div className="text-xs text-brand-muted uppercase tracking-wide mt-1">{t("case.setup")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-12 border-t border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-[10px] uppercase tracking-widest text-brand-muted text-center mb-6">Connects with</div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60 hover:opacity-100 transition-opacity">
            {["Google Ads", "Meta Business", "LinkedIn Ads", "TikTok for Business", "BidMachine", "Stripe", "Claude", "Gemini"].map((n) => (
              <span key={n} className="text-sm font-medium tracking-tight">{n}</span>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ icon: Icon, label }: { icon: typeof Megaphone; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 text-neon shrink-0" />
      <span>{label}</span>
    </div>
  );
}

function Step({ n, Icon, title, desc }: { n: string; Icon: typeof Megaphone; title: string; desc: string }) {
  return (
    <div className="group relative p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 transition-all">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-neon">{n}</span>
        <Icon className="size-4 text-brand-muted group-hover:text-neon transition" />
      </div>
      <h3 className="font-heading text-lg font-medium tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-brand-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureCard({ Icon, title, desc }: { Icon: typeof Megaphone; title: string; desc: string }) {
  return (
    <div className="group p-6 rounded-2xl ring-1 ring-brand-border bg-brand-bg hover:bg-brand-surface transition-all">
      <div className="size-9 rounded-lg bg-brand-surface ring-1 ring-brand-border flex items-center justify-center mb-4 group-hover:ring-neon/40 group-hover:shadow-[0_0_18px_-6px_var(--neon)] transition">
        <Icon className="size-4 text-neon" />
      </div>
      <h3 className="font-medium text-sm mb-1.5">{title}</h3>
      <p className="text-xs text-brand-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({
  tier, amount, unit, features, cta, featured,
}: { tier: string; amount: string; unit: string; features: string[]; cta: string; featured?: boolean }) {
  return (
    <div className={
      "relative p-7 rounded-2xl flex flex-col transition-all hover:-translate-y-0.5 " +
      (featured
        ? "bg-brand-bg ring-1 ring-neon shadow-[0_0_60px_-20px_var(--neon)]"
        : "bg-brand-surface ring-1 ring-brand-border hover:ring-neon/30")
    }>
      {featured && (
        <span className="absolute -top-2.5 left-7 px-2 py-0.5 bg-neon text-[oklch(0.14_0.01_160)] text-[10px] uppercase tracking-widest rounded-full font-medium">
          Recommended
        </span>
      )}
      <span className={"text-[10px] font-medium uppercase tracking-[0.2em] mb-4 " + (featured ? "text-neon" : "text-brand-muted")}>
        {tier}
      </span>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-heading font-medium tracking-tight">{amount}</span>
        <span className="text-sm text-brand-muted">{unit}</span>
      </div>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((f) => (
          <li key={f} className="text-sm flex items-center gap-2 text-brand-muted">
            <Check className={"size-4 shrink-0 " + (featured ? "text-neon" : "text-brand-text")} />
            {f}
          </li>
        ))}
      </ul>
      <button className={"w-full text-sm py-2.5 px-4 rounded-md transition " + (featured ? "btn-neon-solid" : "btn-dark")}>
        {cta}
      </button>
    </div>
  );
}
