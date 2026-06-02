import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import {
  LayoutGrid, Megaphone, Users, Globe, Square, FileText, LogOut, Coins,
  Plug, Wand2, GitBranch, CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Aurevia" }] }),
  component: DashboardLayout,
});

const AGENT_ICONS: Record<string, typeof Megaphone> = {
  ads: Megaphone, leads: Users, reach: Globe, brand: Square, reports: FileText,
};

function DashboardLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [balance, setBalance] = useState<number | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
    const load = async () => {
      const { data } = await supabase.from("credits").select("balance").maybeSingle();
      setBalance(data?.balance ?? 0);
    };
    load();
    const channel = supabase
      .channel("credits-watch")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "credits" }, (p) => {
        const row = p.new as { balance?: number };
        if (typeof row.balance === "number") setBalance(row.balance);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const agents = [
    { slug: "ads", name: t("agents.ads.name") },
    { slug: "leads", name: t("agents.leads.name") },
    { slug: "reach", name: t("agents.reach.name") },
    { slug: "brand", name: t("agents.brand.name") },
    { slug: "reports", name: t("agents.reports.name") },
  ];

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <aside className="w-64 border-r border-brand-border bg-brand-bg flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center border-b border-brand-border">
          <Link to="/" className="font-heading text-xl font-semibold tracking-tight flex items-center gap-2">
            <span className="size-2 rounded-full bg-neon shadow-[0_0_12px_var(--neon)]" />
            Aurevia
          </Link>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
          <SidebarItem to="/dashboard" active={pathname === "/dashboard"} icon={LayoutGrid} label={t("dash.overview")} />

          <Section title={t("dash.agents")}>
            {agents.map((a) => {
              const Icon = AGENT_ICONS[a.slug] ?? Square;
              const to = `/dashboard/agents/${a.slug}`;
              return <SidebarItem key={a.slug} to={to} active={pathname === to} icon={Icon} label={a.name} />;
            })}
          </Section>

          <Section title="Growth">
            <SidebarItem to="/dashboard/funnel" active={pathname === "/dashboard/funnel"} icon={GitBranch} label="Funnel Mind" />
            <SidebarItem to="/dashboard/landing" active={pathname === "/dashboard/landing"} icon={Wand2} label="Landing Builder" />
            <SidebarItem to="/dashboard/integrations" active={pathname === "/dashboard/integrations"} icon={Plug} label="Integrations" />
            <SidebarItem to="/dashboard/billing" active={pathname === "/dashboard/billing"} icon={CreditCard} label="Billing" />
          </Section>
        </nav>
        <div className="px-3 py-4 border-t border-brand-border space-y-3">
          <div className="px-3 py-3 bg-brand-surface ring-1 ring-brand-border rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-brand-muted">{t("dash.credits")}</div>
              <div className="font-heading text-lg font-medium tracking-tight text-neon">{balance ?? "—"}</div>
            </div>
            <Coins className="size-4 text-neon" />
          </div>
          <div className="px-1 flex items-center justify-between gap-2">
            <LanguageSwitcher compact />
            <button onClick={signOut} className="btn-dark p-2" title={t("dash.signout")}>
              <LogOut className="size-4" />
            </button>
          </div>
          <div className="px-2 text-[10px] text-brand-muted truncate">{email}</div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-brand-muted">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarItem({ to, active, icon: Icon, label }: { to: string; active: boolean; icon: typeof Megaphone; label: string }) {
  return (
    <Link
      to={to}
      className={
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all " +
        (active
          ? "bg-brand-surface text-neon ring-1 ring-neon/40 shadow-[0_0_18px_-8px_var(--neon)]"
          : "text-brand-muted hover:text-neon hover:bg-brand-surface/60")
      }
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
