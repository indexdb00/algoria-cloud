import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Megaphone, Users, Globe, Square, FileText, Check, ArrowUpRight, Sparkles,
  Activity, Zap, ShieldCheck, GraduationCap, GitBranch, Plug,
  TrendingUp, Quote, Plus, Minus, Coins, Gift, Infinity as InfinityIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CookieBanner } from "@/components/site/CookieBanner";
import { TypewriterChat } from "@/components/site/TypewriterChat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurevia — AI marketing agents for European brands" },
      { name: "description", content: "Five autonomous AI agents — Ads, Leads, Reach, Brand, Reports — orchestrating campaigns by prompt across European markets." },
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

  const perfStats = [
    { value: "+312%", label: t("perf.roas") },
    { value: "-47%", label: t("perf.cpl") },
    { value: "18h", label: t("perf.time") },
    { value: "+89%", label: t("perf.conv") },
  ];

  const testimonials = [
    { q: t("test.q1"), a: t("test.a1") },
    { q: t("test.q2"), a: t("test.a2") },
    { q: t("test.q3"), a: t("test.a3") },
  ];

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  return (
    <div className="min-h-screen bg-brand-bg font-body text-brand-text overflow-x-hidden">
      <SiteNav />

      {/* Hero */}
      <section className="relative py-20 md:py-32">
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full pointer-events-none animate-pulse"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--neon) 18%, transparent), transparent 70%)",
            filter: "blur(40px)",
            animationDuration: "4s",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 ring-neon/30 bg-neon/5 text-xs text-neon mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="size-1.5 rounded-full bg-neon animate-pulse shadow-[0_0_8px_var(--neon)]" />
              {t("hero.live")}
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-medium leading-[0.95] tracking-tight text-balance mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {t("hero.title")}
            </h1>
            <p className="text-base md:text-lg text-brand-muted text-pretty mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link to="/auth" className="btn-neon-solid text-sm py-2.5 px-4 inline-flex items-center gap-2 group">
                <Sparkles className="size-4" />
                {t("hero.cta")}
                <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <a href="#agents" className="btn-dark text-sm py-2.5 px-4 inline-flex items-center gap-2">
                {t("hero.secondary")}
              </a>
            </div>
            <div className="mt-12 grid grid-cols-3 max-w-md gap-4 text-xs text-brand-muted animate-in fade-in duration-700 delay-500">
              <Stat icon={ShieldCheck} label={t("trust.gdpr")} />
              <Stat icon={Activity} label={t("trust.pulse")} />
              <Stat icon={Zap} label={t("trust.prompt")} />
            </div>
          </div>
        </div>
      </section>

      {/* Live chat showcase — typewriter animation */}
      <section className="relative py-16 md:py-20 border-t border-brand-border">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-[1.05fr,1fr] gap-10 md:gap-14 items-center">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-neon inline-flex items-center gap-1.5">
              <Sparkles className="size-3" /> {t("showcase.tag")}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3 mb-4">
              {t("showcase.title")}
            </h2>
            <p className="text-sm text-brand-muted max-w-md leading-relaxed mb-6">{t("showcase.desc")}</p>
            <ul className="space-y-2 text-sm text-brand-text/90">
              <li className="flex items-center gap-2"><Check className="size-4 text-neon" /> Image, voice, CSV — multi-modal inputs.</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-neon" /> Aspect-ratio & ad-policy gate before any spend.</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-neon" /> Pick Aurevia v1.0, Thinking v1.1 or Plus per prompt.</li>
            </ul>
          </div>
          <TypewriterChat
            prompts={[
              "Launch a Meta Ads campaign for my SaaS demo, €40/day, DACH, 9:16 creative.",
              "Score my last 50 leads by intent — call list please.",
              "Why did ROAS drop on TikTok yesterday?",
              "Draft a 3-week reach push for Spain + Italy, budget €1,800.",
            ]}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-2xl">
            <span className="text-[11px] uppercase tracking-widest text-neon">{t("how.tag")}</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3">
              {t("how.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step n="01" Icon={Plug} title={t("how.s1.title")} desc={t("how.s1.desc")} />
            <Step n="02" Icon={Sparkles} title={t("how.s2.title")} desc={t("how.s2.desc")} />
            <Step n="03" Icon={Activity} title={t("how.s3.title")} desc={t("how.s3.desc")} />
          </div>
        </div>
      </section>

      {/* Performance */}
      <section className="py-20 md:py-24 border-t border-brand-border bg-brand-surface/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="text-[11px] uppercase tracking-widest text-neon inline-flex items-center gap-1.5">
              <TrendingUp className="size-3" /> {t("perf.tag")}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3 mb-3">{t("perf.title")}</h2>
            <p className="text-sm text-brand-muted text-pretty">{t("perf.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {perfStats.map((s, i) => (
              <div
                key={s.label}
                className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-brand-bg ring-1 ring-brand-border hover:ring-neon/40 transition-all group text-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
                  background: "radial-gradient(circle at center, color-mix(in oklab, var(--neon) 12%, transparent), transparent 70%)",
                }} />
                <div className="relative font-heading text-3xl md:text-5xl font-medium tracking-tight text-neon" style={{ textShadow: "0 0 30px color-mix(in oklab, var(--neon) 40%, transparent)" }}>
                  {s.value}
                </div>
                <div className="relative text-[11px] uppercase tracking-widest text-brand-muted mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-20 md:py-24 border-y border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-neon">{t("agents.title")}</span>
              <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3 max-w-xl">
                {t("agents.subtitle")}
              </h2>
            </div>
            <Link to="/auth" className="text-xs text-brand-muted hover:text-neon inline-flex items-center gap-1.5">
              {t("agents.activate")} <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {agents.map(({ Icon, name, desc }, i) => (
              <div
                key={name}
                className="group relative p-5 bg-brand-surface ring-1 ring-brand-border rounded-2xl flex flex-col justify-between h-60 hover:ring-neon/40 hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div>
                  <div className="size-9 bg-brand-bg ring-1 ring-brand-border rounded-lg flex items-center justify-center mb-4 group-hover:ring-neon/40 group-hover:shadow-[0_0_18px_-6px_var(--neon)] transition-all">
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

      {/* Testimonials */}
      <section className="py-20 md:py-24 border-b border-brand-border bg-brand-surface/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12 max-w-xl mx-auto">
            <span className="text-[11px] uppercase tracking-widest text-neon">{t("test.tag")}</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3">{t("test.title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((tt, i) => (
              <figure
                key={i}
                className="relative p-7 rounded-2xl bg-brand-bg ring-1 ring-brand-border hover:ring-neon/40 transition-all"
              >
                <Quote className="size-5 text-neon mb-4 opacity-60" />
                <blockquote className="text-sm leading-relaxed text-brand-text mb-5">"{tt.q}"</blockquote>
                <figcaption className="text-[11px] uppercase tracking-widest text-brand-muted">{tt.a}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Built-in features */}
      <section className="py-20 md:py-24 border-b border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard Icon={GraduationCap} title="Academy" desc="Slide-based tutorials teach you to prompt agents like a senior marketer." />
            <FeatureCard Icon={GitBranch} title="Named funnels" desc="Create unlimited funnel boards per project — your agents fill the stages." />
            <FeatureCard Icon={Plug} title="6 native integrations" desc="Meta Ads, Business Suite, Google Ads, GA4, TikTok Ads, BidMachine — in one workspace." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-24 border-b border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <span className="text-[11px] uppercase tracking-widest text-neon">{t("nav.pricing")}</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3 mb-4">{t("pricing.title")}</h2>
            <p className="text-brand-muted max-w-[54ch] mx-auto text-pretty text-sm">{t("pricing.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PricingCard
              tier={t("pricing.starter")}
              price="€19"
              credits="500"
              unit={t("pricing.creditsMo")}
              features={[t("pricing.starter.f1"), t("pricing.starter.f2"), t("pricing.starter.f3")]}
              cta={t("pricing.chooseStarter")}
            />
            <PricingCard
              tier={t("pricing.growth")}
              price="€59"
              credits="2,500"
              unit={t("pricing.creditsMo")}
              features={[t("pricing.growth.f1"), t("pricing.growth.f2"), t("pricing.growth.f3")]}
              cta={t("pricing.startGrowth")}
              recommendedLabel={t("pricing.recommended")}
              featured
            />
            <PricingCard
              tier={t("pricing.scale")}
              price="€199"
              credits="12,000"
              unit={t("pricing.creditsMo")}
              features={[t("pricing.scale.f1"), t("pricing.scale.f2"), t("pricing.scale.f3")]}
              cta={t("pricing.contact")}
            />
          </div>
        </div>
      </section>

      {/* Case study */}
      <section id="case" className="py-20 md:py-24 border-b border-brand-border">
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

      {/* FAQ */}
      <section className="py-20 md:py-24 border-b border-brand-border bg-brand-surface/40">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <span className="text-[11px] uppercase tracking-widest text-neon">{t("faq.tag")}</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-balance mt-3">{t("faq.title")}</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-12 border-b border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-[10px] uppercase tracking-widest text-brand-muted text-center mb-6">Connects with</div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60 hover:opacity-100 transition-opacity">
            {["Meta Ads", "Meta Business Suite", "Google Ads", "Google Analytics 4", "TikTok Ads", "BidMachine"].map((n) => (
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
    <div className="group relative p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 hover:-translate-y-0.5 transition-all">
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
  tier, price, credits, unit, features, cta, featured, recommendedLabel,
}: { tier: string; price: string; credits: string; unit: string; features: string[]; cta: string; featured?: boolean; recommendedLabel?: string }) {
  return (
    <div className={
      "relative p-7 rounded-2xl flex flex-col transition-all hover:-translate-y-0.5 " +
      (featured
        ? "bg-brand-bg ring-1 ring-neon shadow-[0_0_60px_-20px_var(--neon)]"
        : "bg-brand-surface ring-1 ring-brand-border hover:ring-neon/30")
    }>
      {featured && recommendedLabel && (
        <span className="absolute -top-2.5 left-7 px-2 py-0.5 bg-neon text-[oklch(0.14_0.01_160)] text-[10px] uppercase tracking-widest rounded-full font-medium">
          {recommendedLabel}
        </span>
      )}
      <span className={"text-[10px] font-medium uppercase tracking-[0.2em] mb-3 " + (featured ? "text-neon" : "text-brand-muted")}>
        {tier}
      </span>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-4xl font-heading font-medium tracking-tight">{price}</span>
        <span className="text-sm text-brand-muted">/ mo</span>
      </div>
      <div className="text-xs text-brand-muted mb-6">{credits} {unit}</div>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((f) => (
          <li key={f} className="text-sm flex items-start gap-2 text-brand-muted">
            <Check className={"size-4 shrink-0 mt-0.5 " + (featured ? "text-neon" : "text-brand-text")} />
            {f}
          </li>
        ))}
      </ul>
      <Link to="/auth" className={"w-full text-sm py-2.5 px-4 rounded-md transition text-center " + (featured ? "btn-neon-solid" : "btn-dark")}>
        {cta}
      </Link>
    </div>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-xl bg-brand-bg ring-1 ring-brand-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-brand-surface/60 transition"
      >
        <span className="text-sm font-medium">{q}</span>
        {open ? <Minus className="size-4 text-neon shrink-0" /> : <Plus className="size-4 text-brand-muted shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-brand-muted leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          {a}
        </div>
      )}
    </div>
  );
}
