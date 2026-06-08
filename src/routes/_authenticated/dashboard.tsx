import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";
import { abstractAvatarDataUrl } from "@/lib/avatar";
import {
  LogOut, Coins, Menu, X, ChevronUp, Plus, MessageSquare,
  Trash2, Settings, ShieldCheck, LifeBuoy,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { isAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Aurevia" }] }),
  component: DashboardLayout,
});

type Conv = { id: string; title: string | null; updated_at: string };

function DashboardLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [balance, setBalance] = useState<number | null>(null);
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [open, setOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const checkAdmin = useServerFn(isAdmin);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setUserId(data.user?.id ?? "");
    });
    supabase.from("profiles").select("display_name").maybeSingle().then(({ data }) => {
      if (data?.display_name) setDisplayName(data.display_name);
    });
    const load = async () => {
      const { data } = await supabase.from("credits").select("balance").maybeSingle();
      setBalance(data?.balance ?? 0);
    };
    load();
    loadConvs();
    checkAdmin().then((r) => setAdmin(!!r?.admin)).catch(() => setAdmin(false));
    const channel = supabase
      .channel("credits-watch")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "credits" }, (p) => {
        const row = p.new as { balance?: number };
        if (typeof row.balance === "number") setBalance(row.balance);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => loadConvs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadConvs() {
    const { data } = await supabase
      .from("conversations")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    setConvs(data ?? []);
  }

  // Read active conversation from URL hash so chat page can stay in sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const m = window.location.hash.match(/c=([0-9a-f-]+)/i);
      setActiveConv(m?.[1] ?? null);
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  // Close mobile sidebar on route change
  useEffect(() => { setProfileOpen(false); if (window.innerWidth < 768) setOpen(false); }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function deleteConv(id: string) {
    if (!confirm("Delete this conversation?")) return;
    await supabase.from("messages").delete().eq("conversation_id", id);
    await supabase.from("conversations").delete().eq("id", id);
    setConvs((c) => c.filter((x) => x.id !== id));
    if (activeConv === id) {
      window.location.hash = "";
      navigate({ to: "/dashboard/chat" });
    }
    toast.success("Conversation deleted");
  }

  function openConv(id: string) {
    window.location.hash = `c=${id}`;
    navigate({ to: "/dashboard/chat" });
  }

  function newChat() {
    window.location.hash = "";
    navigate({ to: "/dashboard/chat" });
  }

  const links: { to: string; label: string }[] = [
    { to: "/dashboard/chat", label: t("dash.chat") },
    { to: "/dashboard/funnel", label: t("dash.funnels") },
    { to: "/dashboard/consumo", label: t("dash.consumo") },
    { to: "/dashboard/whatsapp", label: "WhatsApp" },
    { to: "/dashboard/integrations", label: t("dash.integrations") },
    { to: "/dashboard/billing", label: t("dash.billing") },
  ];

  const isActive = (to: string) => pathname.startsWith(to);
  const avatar = abstractAvatarDataUrl(userId || email || "aurevia");

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={t("nav.menu")}
            className="size-9 rounded-xl btn-dark flex items-center justify-center"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <Link to="/" className="font-heading text-base font-medium tracking-tight flex items-center gap-2">
            <BrandMark size={22} />
            Aurevia
          </Link>
        </div>
        <Link to="/dashboard/billing" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md ring-1 ring-brand-border bg-brand-surface">
          <Coins className="size-3 text-neon" />
          <span className="text-xs font-medium text-neon">{balance ?? "—"}</span>
        </Link>
      </header>

      {/* Backdrop on mobile */}
      {open && (
        <button
          aria-hidden
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm top-14"
        />
      )}

      {/* Sidebar — Claude-like */}
      <aside
        className={
          "fixed md:sticky top-0 md:top-0 bottom-0 left-0 z-50 md:z-10 w-72 h-screen bg-brand-bg border-r border-brand-border flex flex-col transition-transform duration-300 " +
          "pt-14 md:pt-0 " +
          (open ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        {/* Brand header */}
        <div className="px-3 pt-4 pb-3 flex items-center gap-2.5 border-b border-brand-border">
          <BrandMark size={26} />
          <div className="min-w-0">
            <div className="font-heading text-base font-medium tracking-tight leading-none">Aurevia</div>
            <div className="text-[10px] uppercase tracking-widest text-brand-muted mt-1">AI marketing OS</div>
          </div>
        </div>

        {/* New chat */}
        <div className="p-3">
          <button
            onClick={newChat}
            className="w-full btn-neon-solid text-sm py-2.5 inline-flex items-center justify-center gap-2"
          >
            <Plus className="size-4" /> {t("chat.new")}
          </button>
        </div>

        {/* Primary nav (text-only) */}
        <nav className="px-2 pb-2 space-y-0.5">
          {links.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={"row-soft block text-sm px-3 py-2 " + (isActive(n.to) ? "is-active font-medium" : "text-brand-text/85")}
            >
              {n.label}
            </Link>
          ))}
          {admin && (
            <Link
              to="/dashboard/admin"
              className={"row-soft block text-sm px-3 py-2 mt-1 inline-flex items-center gap-2 " + (isActive("/dashboard/admin") ? "is-active font-medium" : "text-amber-400/90 hover:text-amber-300")}
            >
              <ShieldCheck className="size-3.5" /> Admin
            </Link>
          )}
        </nav>

        {/* Conversation history */}
        <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-widest text-brand-muted">{t("history.recent")}</div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {convs.length === 0 ? (
            <div className="text-xs text-brand-muted px-3 py-3">{t("history.empty")}</div>
          ) : (
            convs.map((c) => (
              <div key={c.id} className={"group row-soft flex items-center gap-2 pr-1 " + (activeConv === c.id ? "is-active" : "")}>
                <button onClick={() => openConv(c.id)} className="flex-1 min-w-0 text-left flex items-center gap-2 px-3 py-2">
                  <MessageSquare className="size-3.5 shrink-0 opacity-60" />
                  <span className="text-sm truncate">{c.title || t("history.untitled")}</span>
                </button>
                <button
                  onClick={() => deleteConv(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-brand-muted hover:text-red-400 p-1.5"
                  aria-label="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: theme + lang + profile */}
        <div className="border-t border-brand-border p-2 space-y-1 relative">
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
          <div className="px-1"><LanguageSwitcher compact /></div>

          {profileOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-2 bg-brand-surface ring-1 ring-brand-border rounded-xl p-1.5 shadow-2xl shadow-black/40">
              <Link to="/dashboard/profile" className="row-soft block text-sm px-3 py-2 text-brand-text">
                <Settings className="size-3.5 inline mr-2 opacity-70" />{t("profile.title")}
              </Link>
              <Link to="/dashboard/billing" className="row-soft block text-sm px-3 py-2 text-brand-text">
                <Coins className="size-3.5 inline mr-2 opacity-70" />{t("dash.billing")}
              </Link>
              <button onClick={signOut} className="row-soft w-full text-left text-sm px-3 py-2 text-brand-text">
                <LogOut className="size-3.5 inline mr-2 opacity-70" />{t("dash.signout")}
              </button>
            </div>
          )}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="row-soft w-full flex items-center gap-3 px-2 py-2"
          >
            <img src={avatar} alt="" className="size-8 rounded-full ring-1 ring-brand-border" />
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">{displayName || (email.split("@")[0] || "User")}</div>
              <div className="text-[10px] text-brand-muted truncate">{balance ?? 0} {t("dash.credits.unit")}</div>
            </div>
            <ChevronUp className={"size-4 text-brand-muted transition-transform " + (profileOpen ? "" : "rotate-180")} />
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
