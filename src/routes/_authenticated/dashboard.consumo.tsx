import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  MessageSquare, Zap, Coins, Activity, Target, MousePointerClick,
  Sparkles, TrendingUp, Plug,
} from "lucide-react";
import { Tutorial } from "@/components/Tutorial";

export const Route = createFileRoute("/_authenticated/dashboard/consumo")({
  head: () => ({ meta: [{ title: "Consumo — Aurevia" }] }),
  component: ConsumoPage,
});

type DayPoint = { day: string; value: number };
type PlatformPoint = { platform: string; campaigns: number };

function ConsumoPage() {
  const { t } = useI18n();
  const [balance, setBalance] = useState<number | null>(null);
  const [creditsSpent, setCreditsSpent] = useState(0);
  const [chats, setChats] = useState(0);
  const [prompts, setPrompts] = useState(0);
  const [campaigns, setCampaigns] = useState(0);
  const [promptsByDay, setPromptsByDay] = useState<DayPoint[]>([]);
  const [creditsByDay, setCreditsByDay] = useState<DayPoint[]>([]);
  const [campaignsByPlatform, setCampaignsByPlatform] = useState<PlatformPoint[]>([]);
  const [hasIntegrations, setHasIntegrations] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    const [{ data: cred }, { count: convCount }, { data: msgs }, { data: tx }, { data: ints }] = await Promise.all([
      supabase.from("credits").select("balance").maybeSingle(),
      supabase.from("conversations").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("role,content,created_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("credit_transactions").select("amount,created_at").lt("amount", 0),
      supabase.from("user_integrations").select("integration_id"),
    ]);

    setBalance(cred?.balance ?? 0);
    setChats(convCount ?? 0);
    setHasIntegrations((ints?.length ?? 0) > 0);

    const userMsgs = (msgs ?? []).filter((m) => m.role === "user");
    const assistantMsgs = (msgs ?? []).filter((m) => m.role === "assistant");
    setPrompts(userMsgs.length);

    // count CAMPAIGN blocks in assistant responses
    let totalCampaigns = 0;
    const byPlatform: Record<string, number> = {};
    assistantMsgs.forEach((m) => {
      const matches = m.content.match(/CAMPAIGN:/gi);
      if (!matches) return;
      totalCampaigns += matches.length;
      const platMatch = m.content.match(/PLATFORM:\s*([^\n]+)/i);
      const platform = (platMatch?.[1] ?? "Other").split(/\s|,/)[0];
      byPlatform[platform] = (byPlatform[platform] ?? 0) + matches.length;
    });
    setCampaigns(totalCampaigns);
    setCampaignsByPlatform(Object.entries(byPlatform).map(([platform, c]) => ({ platform, campaigns: c })));

    // last 14 days buckets
    const days: string[] = [];
    const dayMs = 86_400_000;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * dayMs);
      days.push(d.toISOString().slice(0, 10));
    }
    const promptDayMap: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
    const creditDayMap: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
    userMsgs.forEach((m) => {
      const k = m.created_at.slice(0, 10);
      if (k in promptDayMap) promptDayMap[k] += 1;
    });
    let spent = 0;
    (tx ?? []).forEach((r) => {
      spent += Math.abs(r.amount);
      const k = r.created_at.slice(0, 10);
      if (k in creditDayMap) creditDayMap[k] += Math.abs(r.amount);
    });
    setCreditsSpent(spent);
    setPromptsByDay(days.map((d) => ({ day: d.slice(5), value: promptDayMap[d] })));
    setCreditsByDay(days.map((d) => ({ day: d.slice(5), value: creditDayMap[d] })));
  }

  const kpis = useMemo(() => ([
    { label: t("cons.chats"),       value: chats,        icon: MessageSquare },
    { label: t("cons.prompts"),     value: prompts,      icon: Zap },
    { label: t("cons.campaigns"),   value: campaigns,    icon: Sparkles },
    { label: t("cons.spent"),       value: creditsSpent, icon: Activity },
    { label: t("cons.balance"),     value: balance ?? 0, icon: Coins },
    { label: t("cons.reach"),       value: "—",          icon: TrendingUp,        hint: !hasIntegrations },
    { label: t("cons.clicks"),      value: "—",          icon: MousePointerClick, hint: !hasIntegrations },
    { label: t("cons.conversions"), value: "—",          icon: Target,            hint: !hasIntegrations },
  ]), [chats, prompts, campaigns, creditsSpent, balance, hasIntegrations, t]);

  return (
    <div className="px-5 md:px-10 py-8 md:py-14 max-w-6xl">
      <Tutorial
        id="consumo-v1"
        title={t("cons.title")}
        steps={[
          { title: t("cons.tour1.title"), body: t("cons.tour1.body") },
          { title: t("cons.tour2.title"), body: t("cons.tour2.body") },
          { title: t("cons.tour3.title"), body: t("cons.tour3.body") },
        ]}
      />

      <div className="mb-8 md:mb-10">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-2">{t("cons.tag")}</div>
        <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">{t("cons.title")}</h1>
        <p className="text-sm text-brand-muted mt-2 max-w-xl">{t("cons.subtitle")}</p>
      </div>

      {/* KPI grid */}
      <section className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="relative overflow-hidden p-4 rounded-2xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 transition">
              <div className="absolute -top-10 -right-10 size-28 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-sky-400 to-blue-600" />
              <div className="relative flex items-center justify-between mb-3">
                <div className="size-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-500/20 to-blue-700/20 ring-1 ring-sky-400/30">
                  <Icon className="size-4 text-neon" />
                </div>
                {k.hint && (
                  <Link to="/dashboard/integrations" className="text-[9px] uppercase tracking-widest text-brand-muted hover:text-neon">
                    {t("cons.connect")}
                  </Link>
                )}
              </div>
              <div className="font-heading text-2xl font-medium tracking-tight tabular-nums">{k.value}</div>
              <div className="text-[11px] text-brand-muted mt-1">{k.label}</div>
            </div>
          );
        })}
      </section>

      {/* Neon charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <NeonChartCard title={t("cons.chart.prompts")} hint={t("cons.last14")}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={promptsByDay}>
              <defs>
                <linearGradient id="neonLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.45 0.01 240 / 0.15)" />
              <XAxis dataKey="day" stroke="oklch(0.55 0.01 240)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.55 0.01 240)" fontSize={10} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ background: "var(--brand-surface)", border: "1px solid var(--brand-border)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="url(#neonLine)" strokeWidth={2.5} dot={false} filter="url(#lineGlow)" />
            </LineChart>
          </ResponsiveContainer>
        </NeonChartCard>

        <NeonChartCard title={t("cons.chart.credits")} hint={t("cons.last14")}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={creditsByDay}>
              <defs>
                <linearGradient id="neonArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.45 0.01 240 / 0.15)" />
              <XAxis dataKey="day" stroke="oklch(0.55 0.01 240)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.55 0.01 240)" fontSize={10} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ background: "var(--brand-surface)", border: "1px solid var(--brand-border)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} fill="url(#neonArea)" style={{ filter: "drop-shadow(0 0 6px rgba(56,189,248,0.4))" }} />
            </AreaChart>
          </ResponsiveContainer>
        </NeonChartCard>
      </section>

      <section className="grid grid-cols-1 gap-4">
        <NeonChartCard title={t("cons.chart.campaigns")} hint={t("cons.byPlatform")}>
          {campaignsByPlatform.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-xs text-brand-muted">{t("cons.noCampaigns")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={campaignsByPlatform}>
                <defs>
                  <linearGradient id="neonBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.45 0.01 240 / 0.15)" />
                <XAxis dataKey="platform" stroke="oklch(0.55 0.01 240)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0.01 240)" fontSize={10} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ background: "var(--brand-surface)", border: "1px solid var(--brand-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="campaigns" fill="url(#neonBar)" radius={[8, 8, 0, 0]} style={{ filter: "drop-shadow(0 0 6px rgba(96,165,250,0.5))" }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </NeonChartCard>
      </section>

      {!hasIntegrations && (
        <div className="mt-6 p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border flex items-start gap-4">
          <div className="size-10 rounded-xl bg-gradient-to-br from-sky-500/30 to-blue-700/30 ring-1 ring-sky-400/30 flex items-center justify-center shrink-0">
            <Plug className="size-4 text-neon" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm mb-1">{t("cons.perfTitle")}</div>
            <p className="text-xs text-brand-muted leading-relaxed mb-3">{t("cons.perfDesc")}</p>
            <Link to="/dashboard/integrations" className="btn-neon text-xs px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg">
              <Plug className="size-3" /> {t("cons.connect")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NeonChartCard({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="relative p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border overflow-hidden">
      <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-60" style={{ boxShadow: "inset 0 0 40px -10px rgba(56,189,248,0.08)" }} />
      <div className="relative mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        {hint && <span className="text-[10px] uppercase tracking-widest text-brand-muted">{hint}</span>}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
