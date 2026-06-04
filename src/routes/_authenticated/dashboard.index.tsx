import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import {
  Megaphone, Users, Globe, Square, FileText, ArrowRight, ArrowUpRight,
  MousePointerClick, Eye, Target, TrendingDown, Briefcase, Activity, Coins, Euro,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardOverview,
});

const AGENT_ICONS: Record<string, typeof Megaphone> = {
  ads: Megaphone, leads: Users, reach: Globe, brand: Square, reports: FileText,
};

// Mocked monthly performance metrics — real numbers will flow once integrations are wired.
const METRICS = {
  clients: 28,
  clicks: 41320,
  visits: 18470,
  completed: 612,
  lost: 184,
  campaigns: 14,
  spend: "€4,820",
  revenue: "€18,940",
  roas: "3.93x",
};

const RECENT = [
  { name: "Q4 Launch — Maison Vert", channel: "Meta Ads", channelColor: "#1877F2", status: "live", budget: "€1,200", results: "184 conv." },
  { name: "DACH Lead Gen Sprint", channel: "Google Ads", channelColor: "#FBBC04", status: "live", budget: "€2,400", results: "312 leads" },
  { name: "TikTok Spark — Spring", channel: "TikTok Ads", channelColor: "#FF0050", status: "paused", budget: "€800", results: "92 conv." },
  { name: "Programmatic Retarget", channel: "BidMachine", channelColor: "#7C3AED", status: "live", budget: "€420", results: "24 conv." },
  { name: "Brand Awareness EU", channel: "Meta Business Suite", channelColor: "#0866FF", status: "draft", budget: "€0", results: "—" },
];

function DashboardOverview() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("display_name").maybeSingle();
      setName(prof?.display_name ?? "");
      const { data: c } = await supabase.from("credits").select("balance").maybeSingle();
      setBalance(c?.balance ?? 0);
    })();
  }, []);

  const agents = [
    { slug: "ads", name: t("agents.ads.name"), desc: t("agents.ads.desc") },
    { slug: "leads", name: t("agents.leads.name"), desc: t("agents.leads.desc") },
    { slug: "reach", name: t("agents.reach.name"), desc: t("agents.reach.desc") },
    { slug: "brand", name: t("agents.brand.name"), desc: t("agents.brand.desc") },
    { slug: "reports", name: t("agents.reports.name"), desc: t("agents.reports.desc") },
  ];

  const stats = [
    { label: t("stats.clients"), value: METRICS.clients.toLocaleString(), icon: Briefcase, trend: "+12%" },
    { label: t("stats.clicks"), value: METRICS.clicks.toLocaleString(), icon: MousePointerClick, trend: "+24%" },
    { label: t("stats.visits"), value: METRICS.visits.toLocaleString(), icon: Eye, trend: "+18%" },
    { label: t("stats.completed"), value: METRICS.completed.toLocaleString(), icon: Target, trend: "+31%" },
    { label: t("stats.lost"), value: METRICS.lost.toLocaleString(), icon: TrendingDown, trend: "-8%", negative: true },
    { label: t("stats.campaigns"), value: METRICS.campaigns.toLocaleString(), icon: Activity, trend: "+3" },
    { label: t("stats.spend"), value: METRICS.spend, icon: Euro, trend: "+€420" },
    { label: t("stats.revenue"), value: METRICS.revenue, icon: TrendingDown, trend: METRICS.roas + " ROAS", positive: true },
  ];

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-6xl">
      <div className="mb-8 md:mb-10 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-2">{t("dash.welcome")}</div>
          <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">{name || "—"}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-surface ring-1 ring-neon/30">
          <Coins className="size-3.5 text-neon" />
          <span className="text-sm font-medium text-neon">{balance ?? "—"}</span>
          <span className="text-[10px] uppercase tracking-widest text-brand-muted">{t("dash.credits.unit")}</span>
        </div>
      </div>

      {/* Performance overview */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neon mb-1.5">{t("stats.month")}</div>
            <h2 className="font-heading text-xl md:text-2xl font-medium tracking-tight">{t("stats.title")}</h2>
          </div>
          <p className="text-xs text-brand-muted max-w-sm">{t("stats.subtitle")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="p-4 rounded-xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 transition">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="size-4 text-brand-muted" />
                  <span
                    className={
                      "text-[10px] font-medium px-1.5 py-0.5 rounded " +
                      (s.negative
                        ? "text-red-400 bg-red-500/10"
                        : "text-neon bg-neon/10")
                    }
                  >
                    {s.trend}
                  </span>
                </div>
                <div className="font-heading text-2xl font-medium tracking-tight">{s.value}</div>
                <div className="text-[11px] text-brand-muted mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent campaigns */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-medium tracking-tight mb-4">{t("stats.recent")}</h2>
        <div className="rounded-2xl bg-brand-surface ring-1 ring-brand-border overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 text-[10px] uppercase tracking-widest text-brand-muted border-b border-brand-border">
            <div className="col-span-5">{t("stats.channel")}</div>
            <div className="col-span-3 hidden sm:block">{t("stats.status")}</div>
            <div className="col-span-2 hidden sm:block">{t("stats.budget")}</div>
            <div className="col-span-7 sm:col-span-2 text-right">{t("stats.results")}</div>
          </div>
          {RECENT.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-4 py-3.5 text-xs items-center border-b border-brand-border last:border-0 hover:bg-brand-bg/40">
              <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                <span className="size-6 rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: r.channelColor }}>
                  {r.channel.charAt(0)}
                </span>
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-[10px] text-brand-muted truncate">{r.channel}</div>
                </div>
              </div>
              <div className="col-span-3 hidden sm:block">
                <span
                  className={
                    "text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md " +
                    (r.status === "live"
                      ? "text-neon bg-neon/10 ring-1 ring-neon/30"
                      : r.status === "paused"
                      ? "text-amber-300 bg-amber-500/10 ring-1 ring-amber-500/30"
                      : "text-brand-muted bg-brand-bg ring-1 ring-brand-border")
                  }
                >
                  {r.status === "live" ? t("stats.live") : r.status === "paused" ? t("stats.paused") : t("stats.draft")}
                </span>
              </div>
              <div className="col-span-2 hidden sm:block text-brand-muted">{r.budget}</div>
              <div className="col-span-7 sm:col-span-2 text-right font-medium">{r.results}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Agents grid */}
      <h2 className="font-heading text-xl font-medium tracking-tight mb-4">{t("dash.agents")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((a) => {
          const Icon = AGENT_ICONS[a.slug] ?? Square;
          return (
            <Link
              key={a.slug}
              to={`/dashboard/agents/${a.slug}`}
              className="group p-5 ring-1 ring-brand-border rounded-2xl bg-brand-surface hover:ring-neon/40 hover:shadow-[0_0_30px_-12px_var(--neon)] transition-all flex flex-col h-48 justify-between"
            >
              <div>
                <div className="size-9 bg-brand-bg ring-1 ring-brand-border rounded-lg flex items-center justify-center mb-3 group-hover:ring-neon/40 transition">
                  <Icon className="size-4 text-neon" />
                </div>
                <h3 className="font-medium text-sm mb-1.5">{a.name}</h3>
                <p className="text-xs text-brand-muted leading-relaxed line-clamp-2">{a.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-brand-muted group-hover:text-neon transition">
                {t("dash.startChat")} <ArrowRight className="size-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
