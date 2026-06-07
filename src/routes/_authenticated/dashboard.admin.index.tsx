import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminStats } from "@/lib/admin.functions";
import { Users, MessageSquare, Zap, Coins } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fetchStats = useServerFn(adminStats);
  const [s, setS] = useState<{ users: number; conversations: number; messages: number; credits: number } | null>(null);

  useEffect(() => { fetchStats().then((r) => { if (!r?.error) setS(r); }); }, [fetchStats]);

  const cards = [
    { label: "Total users", value: s?.users ?? "—", icon: Users },
    { label: "Conversations", value: s?.conversations ?? "—", icon: MessageSquare },
    { label: "Messages", value: s?.messages ?? "—", icon: Zap },
    { label: "Credits in circulation", value: s?.credits ?? "—", icon: Coins },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="p-4 rounded-2xl bg-brand-surface ring-1 ring-brand-border">
              <div className="size-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-700/20 ring-1 ring-sky-400/30 flex items-center justify-center mb-3">
                <Icon className="size-4 text-neon" />
              </div>
              <div className="font-heading text-2xl font-medium tracking-tight tabular-nums">{c.value}</div>
              <div className="text-[11px] text-brand-muted mt-1">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border text-xs text-brand-muted leading-relaxed">
        Connect Stripe via Settings → Payments to surface MRR, active subscriptions, churn, and refund actions on the Payments tab.
      </div>
    </div>
  );
}
