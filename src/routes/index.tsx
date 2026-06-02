import { createFileRoute, Link } from "@tanstack/react-router";
import { Megaphone, Users, Globe, Square, FileText, Check, Square as Sq } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurevia — AI marketing agents for European brands" },
      { name: "description", content: "Five specialized AI agents — Ads, Leads, Reach, Brand, Reports — orchestrating your marketing across European markets. Credit-based, multilingual." },
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
    <div className="min-h-screen bg-brand-bg font-body text-brand-text">
      <SiteNav />

      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-[40ch]">
            <h1 className="font-heading text-5xl md:text-6xl font-medium leading-none tracking-tight text-balance mb-8">
              {t("hero.title")}
            </h1>
            <p className="text-lg text-brand-muted text-pretty mb-10">{t("hero.subtitle")}</p>
            <div className="flex items-center gap-4">
              <Link
                to="/auth"
                className="text-sm bg-brand-accent text-white py-2 pr-4 pl-3 ring-1 ring-brand-accent rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Sq className="size-4 shrink-0" />
                {t("hero.cta")}
              </Link>
              <a
                href="#case"
                className="text-sm bg-secondary text-brand-text py-2 px-4 ring-1 ring-brand-border rounded-md hover:bg-muted transition-colors"
              >
                {t("hero.secondary")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-24 bg-brand-surface">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <h2 className="font-heading text-3xl font-medium tracking-tight text-balance">{t("agents.title")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {agents.map(({ Icon, name, desc }) => (
              <div key={name} className="p-6 bg-brand-bg ring-1 ring-brand-border rounded-2xl flex flex-col justify-between h-64">
                <div>
                  <div className="size-8 bg-brand-surface rounded-lg flex items-center justify-center mb-4">
                    <Icon className="size-4 text-brand-text" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">{name}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">{desc}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand-muted">{t("agents.active")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-medium tracking-tight text-balance mb-4">{t("pricing.title")}</h2>
            <p className="text-brand-muted max-w-[48ch] mx-auto text-pretty">{t("pricing.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              tier={t("pricing.starter")}
              amount="500"
              unit={t("pricing.creditsMo")}
              features={[t("pricing.starter.f1"), t("pricing.starter.f2")]}
              cta={t("pricing.chooseStarter")}
            />
            <PricingCard
              tier={t("pricing.growth")}
              amount="2,000"
              unit={t("pricing.creditsMo")}
              features={[t("pricing.growth.f1"), t("pricing.growth.f2")]}
              cta={t("pricing.startGrowth")}
              featured
            />
            <PricingCard
              tier={t("pricing.scale")}
              amount="10,000"
              unit={t("pricing.creditsMo")}
              features={[t("pricing.scale.f1"), t("pricing.scale.f2")]}
              cta={t("pricing.contact")}
            />
          </div>
        </div>
      </section>

      {/* Case study */}
      <section id="case" className="py-24 border-t border-brand-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="w-full aspect-[4/3] bg-brand-surface outline outline-1 -outline-offset-1 outline-brand-border rounded-xl grid place-items-center">
              <span className="text-[10px] font-medium uppercase tracking-widest text-brand-muted">Værløse · DACH</span>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-widest text-brand-muted mb-4 block">{t("case.tag")}</span>
              <h2 className="font-heading text-4xl font-medium leading-tight tracking-tight text-balance mb-6">{t("case.title")}</h2>
              <p className="text-brand-muted text-pretty mb-8">{t("case.body")}</p>
              <div className="flex gap-12">
                <div>
                  <div className="text-2xl font-heading font-medium tracking-tight">412%</div>
                  <div className="text-xs text-brand-muted uppercase tracking-wide">{t("case.roi")}</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-medium tracking-tight">{t("case.setupVal")}</div>
                  <div className="text-xs text-brand-muted uppercase tracking-wide">{t("case.setup")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-12 border-t border-b border-brand-border">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-8 opacity-50">
          <span className="text-sm font-medium tracking-tight">Google Ads</span>
          <span className="text-sm font-medium tracking-tight">Meta Business</span>
          <span className="text-sm font-medium tracking-tight">LinkedIn Ads</span>
          <span className="text-sm font-medium tracking-tight">TikTok For Business</span>
          <span className="text-sm font-medium tracking-tight">Claude · Gemini</span>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function PricingCard({
  tier, amount, unit, features, cta, featured,
}: { tier: string; amount: string; unit: string; features: string[]; cta: string; featured?: boolean }) {
  return (
    <div className={
      "p-8 rounded-2xl flex flex-col " +
      (featured
        ? "bg-brand-accent text-white ring-1 ring-brand-accent"
        : "bg-brand-bg ring-1 ring-brand-border")
    }>
      <span className={"text-[10px] font-medium uppercase tracking-[0.2em] mb-4 " + (featured ? "text-white/60" : "text-brand-muted")}>
        {tier}
      </span>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-heading font-medium tracking-tight">{amount}</span>
        <span className={"text-sm " + (featured ? "text-white/60" : "text-brand-muted")}>{unit}</span>
      </div>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((f) => (
          <li key={f} className={"text-sm flex items-center gap-2 " + (featured ? "text-white/80" : "text-brand-muted")}>
            <Check className={"size-4 shrink-0 " + (featured ? "text-white" : "text-brand-text")} />
            {f}
          </li>
        ))}
      </ul>
      <button className={
        "w-full text-sm py-2 px-4 rounded-md " +
        (featured ? "bg-brand-bg text-brand-text hover:opacity-90" : "bg-secondary text-brand-text ring-1 ring-brand-border hover:bg-muted")
      }>
        {cta}
      </button>
    </div>
  );
}
