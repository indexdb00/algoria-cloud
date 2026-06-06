import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import {
  LayoutGrid, MessageSquare, GitBranch, Plug, CreditCard, GraduationCap,
  LogOut, Coins, Menu, X, User as UserIcon, ChevronUp,
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
  const [displayName, setDisplayName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    supabase.from("profiles").select("display_name").maybeSingle().then(({ data }) => {
      if (data?.display_name) setDisplayName(data.display_name);
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

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); setProfileOpen(false); }, [pathname]);

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
    { to: "/dashboard/billing", icon: CreditCard, label: t("dash.billing"), grad: "from-rose-300 to-pink-700" },
  ];

  const isActive = (to: string) =>
    to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(to);

  const initials = (displayName || email || "U")
    .split(/[ @.]/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Topbar with green hamburger (always visible) */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border flex items-center justify-between px-3 md:px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={t("nav.menu")}
            className="size-9 rounded-xl btn-neon-solid flex items-center justify-center"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <Link to="/" className="font-heading text-base font-semibold tracking-tight flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-neon shadow-[0_0_10px_var(--neon)]" />
            Aurevia
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <Link to="/dashboard/billing" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md ring-1 ring-brand-border bg-brand-surface hover:ring-neon/40 transition">
            <Coins className="size-3 text-neon" />
            <span className="text-xs font-medium text-neon">{balance ?? "—"}</span>
          </Link>
        </div>
      </header>

      {/* Slide-in sidebar (desktop + mobile) */}
      {open && (
        <button
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm top-14"
        />
      )}
      <aside
        className={
          "fixed top-14 bottom-0 left-0 z-50 w-72 bg-brand-bg border-r border-brand-border flex flex-col transition-transform duration-300 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-brand-muted px-2 mb-2">{t("nav.menu")}</div>
          {primary.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "group flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm transition-all " +
                  (active
                    ? "bg-brand-surface text-brand-text ring-1 ring-neon/40"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-surface/60")
                }
              >
                <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${active ? `bg-gradient-to-br ${n.grad} shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_14px_-6px_rgba(0,0,0,0.6)] ring-1 ring-white/10` : "bg-brand-bg ring-1 ring-brand-border group-hover:ring-neon/30"}`}>
                  <Icon className={`size-4 ${active ? "text-white drop-shadow" : "text-brand-muted group-hover:text-neon"}`} />
                </div>
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile pop-up at bottom of sidebar */}
        <div className="border-t border-brand-border p-3 relative">
          {profileOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-brand-surface ring-1 ring-brand-border rounded-xl p-2 shadow-2xl shadow-black/60">
              <Link
                to="/dashboard/profile"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-brand-text hover:bg-brand-bg/60 hover:text-neon"
              >
                <UserIcon className="size-4" />
                {t("profile.title")}
              </Link>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-brand-text hover:bg-brand-bg/60 hover:text-neon"
              >
                <LogOut className="size-4" />
                {t("dash.signout")}
              </button>
            </div>
          )}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-brand-surface/60 transition"
          >
            <div className="size-9 rounded-full icon-3d flex items-center justify-center text-[oklch(0.16_0.01_160)] text-xs font-semibold">
              {initials || <UserIcon className="size-4" />}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">{displayName || (email.split("@")[0] || t("profile.title"))}</div>
              <div className="text-[10px] text-brand-muted truncate">{email}</div>
            </div>
            <ChevronUp className={"size-4 text-brand-muted transition-transform " + (profileOpen ? "" : "rotate-180")} />
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pt-14">
        <Outlet />
      </main>
    </div>
  );
}
