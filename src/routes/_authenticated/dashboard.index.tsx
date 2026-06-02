import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Users, Globe, Square, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardOverview,
});

const ICONS: Record<string, typeof Megaphone> = {
  ads: Megaphone, leads: Users, reach: Globe, brand: Square, reports: FileText,
};

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

  return (
    <div className="px-10 py-12 max-w-6xl">
      <div className="mb-12">
        <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-3">{t("dash.welcome")}</div>
        <h1 className="font-heading text-4xl font-medium tracking-tight">{name || "—"}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="p-6 ring-1 ring-brand-border rounded-2xl bg-brand-bg">
          <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-2">{t("dash.balance")}</div>
          <div className="font-heading text-4xl font-medium tracking-tight">{balance ?? "—"}</div>
          <div className="text-xs text-brand-muted mt-1">{t("dash.credits.unit")}</div>
        </div>
        <div className="p-6 ring-1 ring-brand-border rounded-2xl bg-brand-surface md:col-span-2">
          <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-2">{t("agents.title")}</div>
          <p className="text-sm text-brand-muted leading-relaxed">{t("hero.subtitle")}</p>
        </div>
      </div>

      <h2 className="font-heading text-2xl font-medium tracking-tight mb-6">{t("dash.agents")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((a) => {
          const Icon = ICONS[a.slug] ?? Square;
          return (
            <Link
              key={a.slug}
              to={`/dashboard/agents/${a.slug}`}
              className="group p-6 ring-1 ring-brand-border rounded-2xl bg-brand-bg hover:bg-brand-surface transition-colors flex flex-col h-56 justify-between"
            >
              <div>
                <div className="size-8 bg-brand-surface group-hover:bg-brand-bg rounded-lg flex items-center justify-center mb-4 transition-colors">
                  <Icon className="size-4 text-brand-text" />
                </div>
                <h3 className="font-medium text-sm mb-2">{a.name}</h3>
                <p className="text-xs text-brand-muted leading-relaxed">{a.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-brand-muted group-hover:text-brand-text transition-colors">
                {t("dash.startChat")} <ArrowRight className="size-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
