import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { isAdmin } from "@/lib/admin.functions";
import { ShieldCheck, LayoutDashboard, MessageSquare, CreditCard, User, LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin — Aurevia" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const check = useServerFn(isAdmin);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    check().then((r) => setAllowed(!!r?.admin)).catch(() => setAllowed(false));
  }, [check]);

  if (allowed === null) {
    return (
      <div className="px-10 py-14 text-xs uppercase tracking-widest text-brand-muted">Checking permissions…</div>
    );
  }
  if (!allowed) {
    return (
      <div className="px-10 py-14 max-w-xl">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-2">Admin</div>
        <h1 className="font-heading text-3xl font-medium tracking-tight mb-3">Access denied</h1>
        <p className="text-sm text-brand-muted">You don't have admin privileges on this workspace.</p>
      </div>
    );
  }

  const tabs = [
    { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/admin/chat", label: "Claude Chat", icon: MessageSquare },
    { to: "/dashboard/admin/support", label: "Support", icon: LifeBuoy },
    { to: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/dashboard/admin/profile", label: "Profile", icon: User },
  ];
  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-6xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center ring-1 ring-white/10 shadow-[0_8px_24px_-8px_#f59e0b]">
          <ShieldCheck className="size-5 text-white" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neon">Admin</div>
          <h1 className="font-heading text-2xl font-medium tracking-tight">Aurevia Admin</h1>
        </div>
      </div>

      <nav className="mb-6 flex gap-1 border-b border-brand-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.to, tab.exact);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={
                "px-3 py-2 text-sm inline-flex items-center gap-2 border-b-2 -mb-px transition " +
                (active ? "border-neon text-brand-text" : "border-transparent text-brand-muted hover:text-brand-text")
              }
            >
              <Icon className="size-3.5" /> {tab.label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
