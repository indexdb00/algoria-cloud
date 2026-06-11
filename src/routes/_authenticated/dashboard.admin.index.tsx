import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminStats } from "@/lib/admin.functions";
import { Users, MessageSquare, Zap, Coins } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/admin/")({
  component: AdminOverview,
});

const trend = [
  { d: "Mon", users: 14, msgs: 120 },
  { d: "Tue", users: 22, msgs: 188 },
  { d: "Wed", users: 31, msgs: 240 },
  { d: "Thu", users: 28, msgs: 210 },
  { d: "Fri", users: 41, msgs: 305 },
  { d: "Sat", users: 36, msgs: 260 },
  { d: "Sun", users: 49, msgs: 360 },
];

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
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-6xl">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-1">Dev · Overview</div>
        <h1 className="text-2xl font-medium tracking-tight">Painel de controle</h1>
        <p className="text-xs text-brand-muted mt-1">Métricas em tempo real, usuários, mensagens e créditos.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="p-4 rounded-2xl neon-card">
              <div className="size-9 rounded-xl bg-neon/15 ring-1 ring-neon/40 flex items-center justify-center mb-3 neon-glow">
                <Icon className="size-4 text-neon" />
              </div>
              <div className="font-heading text-2xl font-medium tracking-tight tabular-nums">{c.value}</div>
              <div className="text-[11px] text-brand-muted mt-1">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl neon-card">
          <div className="text-[10px] uppercase tracking-widest neon-text mb-1">Last 7 days</div>
          <div className="font-heading text-base font-medium mb-4">Active users</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="neonFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.74 0.16 245)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.74 0.16 245)" stopOpacity={0} />
                  </linearGradient>
                  <filter id="neonGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid stroke="oklch(0.30 0.035 250)" strokeDasharray="3 3" />
                <XAxis dataKey="d" tick={{ fill: "oklch(0.65 0.02 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.65 0.02 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.21 0.025 250)", border: "1px solid oklch(0.74 0.16 245)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "oklch(0.97 0.01 240)" }}
                />
                <Area type="monotone" dataKey="users" stroke="oklch(0.74 0.16 245)" strokeWidth={2} fill="url(#neonFill)" filter="url(#neonGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl neon-card">
          <div className="text-[10px] uppercase tracking-widest neon-text mb-1">Last 7 days</div>
          <div className="font-heading text-base font-medium mb-4">Messages sent</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.30 0.035 250)" strokeDasharray="3 3" />
                <XAxis dataKey="d" tick={{ fill: "oklch(0.65 0.02 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.65 0.02 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.21 0.025 250)", border: "1px solid oklch(0.74 0.16 245)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "oklch(0.97 0.01 240)" }}
                />
                <Bar dataKey="msgs" fill="oklch(0.74 0.16 245)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
