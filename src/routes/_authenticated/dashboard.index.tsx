import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, GitBranch, Plug, GraduationCap, MessageSquare, Coins,
  Activity, ArrowRight, Zap, BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardOverview,
});

type CampaignCount = number;

function DashboardOverview() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [convCount, setConvCount] = useState<CampaignCount | null>(null);
  const [msgCount, setMsgCount] = useState<CampaignCount | null>(null);
  const [creditsSpent, setCreditsSpent] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("display_name").maybeSingle();
      setName(prof?.display_name ?? "");
      const { data: c } = await supabase.from("credits").select("balance").maybeSingle();
      setBalance(c?.balance ?? 0);
      const { count: cc } = await supabase.from("conversations").select("id", { count: "exact", head: true });
      setConvCount(cc ?? 0);
      const { count: mc } = await supabase.from("messages").select("id", { count: "exact", head: true }).eq("role", "user");
      setMsgCount(mc ?? 0);
      const { data: tx } = await supabase.from("credit_transactions").select("amount").lt("amount", 0);
      setCreditsSpent((tx ?? []).reduce((a, r) => a + Math.abs(r.amount), 0));
    })();
  }, []);

  const shortcuts = [
    { to: "/dashboard/chat", icon: MessageSquare, label: t("dash.chat"), grad: "from-emerald-400 to-emerald-700", desc: t("dash.chat.desc") },
    { to: "/dashboard/funnel", icon: GitBranch, label: t("dash.funnels"), grad: "from-sky-400 to-indigo-700", desc: t("dash.funnels.desc") },
    { to: "/dashboard/integrations", icon: Plug, label: t("dash.integrations"), grad: "from-violet-400 to-purple-700", desc: t("dash.integrations.desc") },
    { to: "/dashboard/academy", icon: GraduationCap, label: t("dash.academy"), grad: "from-amber-300 to-orange-600", desc: t("dash.academy.desc") },
  ];

  const stats = [
    { label: t("over.conversations"), value: convCount ?? "—", icon: MessageSquare },
    { label: t("over.prompts"), value: msgCount ?? "—", icon: Zap },
    { label: t("over.creditsUsed"), value: creditsSpent ?? "—", icon: Activity },
    { label: t("over.creditsLeft"), value: balance ?? "—", icon: Coins },
  ];

  return (
    <div className="px-5 md:px-10 py-8 md:py-14 max-w-6xl">
      <div className="mb-8 md:mb-10 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-2">{t("dash.welcome")}</div>
          <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">{name || "—"}</h1>
        </div>
        <Link to="/dashboard/chat" className="btn-neon-solid text-sm px-4 py-2.5 inline-flex items-center gap-2 rounded-xl">
          <Sparkles className="size-4" /> {t("over.openChat")}
        </Link>
      </div>

      {/* Real activity stats */}
      <section className="mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="p-4 rounded-2xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-9 rounded-xl icon-3d flex items-center justify-center">
                    <Icon className="size-4 text-[oklch(0.16_0.01_160)]" />
                  </div>
                </div>
                <div className="font-heading text-2xl font-medium tracking-tight">{s.value}</div>
                <div className="text-[11px] text-brand-muted mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-brand-muted mt-3">{t("over.realOnly")}</p>
      </section>

      {/* Shortcuts grid with 3D gradient tiles */}
      <h2 className="font-heading text-xl font-medium tracking-tight mb-4">{t("over.shortcuts")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {shortcuts.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.to}
              to={s.to}
              className="group relative overflow-hidden p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 hover:shadow-[0_20px_50px_-20px_var(--neon)] transition-all"
            >
              <div className={`absolute -top-10 -right-10 size-36 rounded-full blur-3xl opacity-30 bg-gradient-to-br ${s.grad}`} />
              <div className="relative flex items-center gap-4">
                <div className={`size-14 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_25px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/10 group-hover:scale-110 transition-transform`}>
                  <Icon className="size-6 text-white drop-shadow" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-0.5">{s.label}</div>
                  <div className="text-xs text-brand-muted line-clamp-1">{s.desc}</div>
                </div>
                <ArrowRight className="size-4 text-brand-muted group-hover:text-neon group-hover:translate-x-1 transition" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty performance hint */}
      <section className="p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border flex items-start gap-4">
        <div className="size-10 rounded-xl icon-3d flex items-center justify-center shrink-0">
          <BarChart3 className="size-4 text-[oklch(0.16_0.01_160)]" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm mb-1">{t("over.perfTitle")}</div>
          <p className="text-xs text-brand-muted leading-relaxed mb-3">{t("over.perfDesc")}</p>
          <Link to="/dashboard/integrations" className="btn-neon text-xs px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg">
            <Plug className="size-3" /> {t("over.connectNow")}
          </Link>
        </div>
      </section>
    </div>
  );
}
