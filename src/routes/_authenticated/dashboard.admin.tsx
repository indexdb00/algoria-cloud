import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { isAdmin } from "@/lib/admin.functions";
import {
  ShieldCheck,
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  User,
  LifeBuoy,
  Banknote,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin — Algoria" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const check = useServerFn(isAdmin);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    check().then((r) => setAllowed(!!r?.admin)).catch(() => setAllowed(false));
  }, [check]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (allowed === null) {
    return (
      <div className="fixed inset-0 z-50 bg-brand-bg flex items-center justify-center text-xs uppercase tracking-widest text-brand-muted">
        Checking permissions…
      </div>
    );
  }
  if (!allowed) {
    return (
      <div className="fixed inset-0 z-50 bg-brand-bg flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-[10px] uppercase tracking-widest neon-text mb-2">Admin</div>
          <h1 className="font-heading text-3xl font-medium tracking-tight mb-3">Access denied</h1>
          <p className="text-sm text-brand-muted mb-6">You don't have admin privileges on this workspace.</p>
          <Link to="/dashboard/chat" className="btn-neon-solid text-xs px-3.5 py-2 rounded-lg">Back to app</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/admin/chat", label: "Claude Chat", icon: MessageSquare },
    { to: "/dashboard/admin/support", label: "Support", icon: LifeBuoy },
    { to: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/dashboard/admin/stripe", label: "Stripe", icon: Banknote },
    { to: "/dashboard/admin/profile", label: "Profile", icon: User },
  ];
  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="fixed inset-0 z-40 bg-brand-bg flex">
      {/* Sidebar */}
      <aside
        className={
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-brand-surface border-r border-brand-border flex flex-col transition-transform " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        <div className="px-5 h-16 flex items-center gap-3 border-b border-brand-border">
          <div className="size-9 rounded-xl bg-neon/15 ring-1 ring-neon/40 flex items-center justify-center">
            <ShieldCheck className="size-4 text-neon" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neon leading-none">Dev</div>
            <div className="text-sm font-medium tracking-tight">algoria</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto md:hidden text-brand-muted"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.to, tab.exact);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition " +
                  (active
                    ? "bg-neon/15 neon-text neon-border"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-bg/60")
                }
              >
                <Icon className="size-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-brand-border">
          <Link to="/dashboard/chat" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-brand-muted hover:text-brand-text hover:bg-brand-bg/60 transition">
            <ArrowLeft className="size-3.5" /> Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 border-b border-brand-border flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="size-9 rounded-lg btn-dark flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <BrandMark size={20} />
            <span className="text-sm font-medium">Dev</span>
          </div>
          <div className="w-9" />
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
