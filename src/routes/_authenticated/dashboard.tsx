import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import {
  LayoutGrid, MessageSquare, GitBranch, Plug, CreditCard, GraduationCap,
  LogOut, Coins,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Aurevia" }] }),
  component: DashboardLayout,
});

type NavItem = { to: string; icon: typeof LayoutGrid; label: string; grad: string };

function DashboardLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [balance, setBalance] = useState<number | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
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

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const primary: NavItem[] = [
    { to: "/dashboard", icon: LayoutGrid, label: t("dash.overview"), grad: "from-emerald-300 to-emerald-700" },
    { to: "/dashboard/chat", icon: MessageSquare, label: t("dash.chat"), grad: "from-teal-300 to-emerald-700" },
    { to: "/dashboard/funnel", icon: GitBranch, label: t("dash.funnels"), grad: "from-sky-300 to-indigo-700" },
    { to: "/dashboard/integrations", icon: Plug, label: t("dash.integrations"), grad: "from-violet-300 to-purple-700" },
    { to: "/dashboard/academy", icon: GraduationCap, label: t("dash.academy"), grad: "from-amber-300 to-orange-600" },
  ];

  const isActive = (to: string) =>
    to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-brand-border bg-brand-bg flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center border-b border-brand-border">
          <Link to="/" className="font-heading text-xl font-semibold tracking-tight flex items-center gap-2">
            <span className="size-2 rounded-full bg-neon shadow-[0_0_12px_var(--neon)]" />
            Aurevia
          </Link>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {primary.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "group flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all " +
                  (active
                    ? "bg-brand-surface text-brand-text ring-1 ring-neon/40"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-surface/60")
                }
              >
                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${active ? `bg-gradient-to-br ${n.grad} shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_14px_-6px_rgba(0,0,0,0.6)] ring-1 ring-white/10` : "bg-brand-bg ring-1 ring-brand-border group-hover:ring-neon/30"}`}>
                  <Icon className={`size-4 ${active ? "text-white drop-shadow" : "text-brand-muted group-hover:text-neon"}`} />
                </div>
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
          <div className="pt-4 mt-4 border-t border-brand-border">
            <Link
              to="/dashboard/billing"
              className={
                "group flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all " +
                (isActive("/dashboard/billing")
                  ? "bg-brand-surface text-brand-text ring-1 ring-neon/40"
                  : "text-brand-muted hover:text-brand-text hover:bg-brand-surface/60")
              }
            >
              <div className="size-8 rounded-lg bg-brand-bg ring-1 ring-brand-border flex items-center justify-center group-hover:ring-neon/30">
                <CreditCard className="size-4 text-brand-muted group-hover:text-neon" />
              </div>
              <span>{t("dash.billing")}</span>
            </Link>
          </div>
        </nav>
        <div className="px-3 py-4 border-t border-brand-border space-y-3">
          <div className="px-3 py-3 bg-brand-surface ring-1 ring-brand-border rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-brand-muted">{t("dash.credits")}</div>
              <div className="font-heading text-lg font-medium tracking-tight text-neon">{balance ?? "—"}</div>
            </div>
            <div className="size-8 rounded-lg icon-3d flex items-center justify-center">
              <Coins className="size-4 text-[oklch(0.16_0.01_160)]" />
            </div>
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

      {/* Mobile topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-brand-bg/90 backdrop-blur border-b border-brand-border flex items-center justify-between px-4">
        <Link to="/" className="font-heading text-base font-semibold tracking-tight flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-neon shadow-[0_0_10px_var(--neon)]" />
          Aurevia
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md ring-1 ring-brand-border bg-brand-surface">
            <Coins className="size-3 text-neon" />
            <span className="text-xs font-medium text-neon">{balance ?? "—"}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-w-0 pt-14 pb-16 md:pt-0 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-brand-bg/95 backdrop-blur-lg border-t border-brand-border flex items-stretch px-1">
        {primary.map((n) => {
          const Icon = n.icon;
          const active = isActive(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neon rounded-full shadow-[0_0_8px_var(--neon)]" />}
              <div className={`size-8 rounded-xl flex items-center justify-center transition-all ${active ? `bg-gradient-to-br ${n.grad} shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_14px_-6px_rgba(0,0,0,0.6)] ring-1 ring-white/10` : "bg-transparent"}`}>
                <Icon className={`size-[18px] ${active ? "text-white drop-shadow" : "text-brand-muted"}`} />
              </div>
              <span className={`text-[9px] tracking-wide ${active ? "text-neon" : "text-brand-muted"}`}>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
