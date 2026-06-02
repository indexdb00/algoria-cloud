import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Megaphone, Users, Globe, Square, FileText, Target, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/funnel")({
  head: () => ({ meta: [{ title: "Funnel Mind — Aurevia" }] }),
  component: FunnelMind,
});

type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
  kind: "source" | "agent" | "page" | "goal";
  icon: typeof Megaphone;
  desc?: string;
};

const INITIAL: Node[] = [
  { id: "meta", x: 80, y: 60, label: "Meta Ads", kind: "source", icon: Megaphone, desc: "Cold prospecting" },
  { id: "google", x: 80, y: 220, label: "Google Ads", kind: "source", icon: Globe, desc: "Search intent" },
  { id: "bid", x: 80, y: 380, label: "BidMachine", kind: "source", icon: Target, desc: "Programmatic RTB" },
  { id: "ads-agent", x: 360, y: 80, label: "Ads Agent", kind: "agent", icon: Megaphone, desc: "Bids & creatives" },
  { id: "leads-agent", x: 360, y: 260, label: "Leads Agent", kind: "agent", icon: Users, desc: "Intent scoring" },
  { id: "brand-agent", x: 360, y: 420, label: "Brand Agent", kind: "agent", icon: Square, desc: "Copy & tone" },
  { id: "landing", x: 640, y: 160, label: "Landing Page", kind: "page", icon: FileText, desc: "Hero + form" },
  { id: "checkout", x: 640, y: 340, label: "Checkout", kind: "page", icon: ShoppingCart, desc: "Stripe payment" },
  { id: "goal", x: 920, y: 250, label: "Conversion", kind: "goal", icon: Target, desc: "Revenue / Lead" },
];

const EDGES: [string, string][] = [
  ["meta", "ads-agent"],
  ["google", "ads-agent"],
  ["bid", "ads-agent"],
  ["meta", "leads-agent"],
  ["google", "leads-agent"],
  ["ads-agent", "landing"],
  ["leads-agent", "landing"],
  ["brand-agent", "landing"],
  ["brand-agent", "checkout"],
  ["landing", "checkout"],
  ["landing", "goal"],
  ["checkout", "goal"],
];

function FunnelMind() {
  const [nodes] = useState<Node[]>(INITIAL);

  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 border-b border-brand-border px-8 flex items-center justify-between shrink-0">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neon">Funnel Mind</div>
          <div className="text-sm font-medium">Visual orchestration of your acquisition flow</div>
        </div>
        <button className="btn-neon text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
          <Plus className="size-3.5" /> Add node
        </button>
      </header>

      <div className="flex-1 overflow-auto bg-brand-bg relative">
        <div
          className="relative"
          style={{
            width: 1120,
            height: 560,
            backgroundImage:
              "radial-gradient(circle, color-mix(in oklab, var(--brand-border) 80%, transparent) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <svg className="absolute inset-0 pointer-events-none" width={1120} height={560}>
            <defs>
              <linearGradient id="edge" x1="0" x2="1">
                <stop offset="0%" stopColor="var(--neon)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--neon)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {EDGES.map(([a, b], i) => {
              const A = nodes.find((n) => n.id === a)!;
              const B = nodes.find((n) => n.id === b)!;
              const x1 = A.x + 200;
              const y1 = A.y + 40;
              const x2 = B.x;
              const y2 = B.y + 40;
              const cx = (x1 + x2) / 2;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="url(#edge)"
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>
          {nodes.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="absolute w-[200px] rounded-xl bg-brand-surface ring-1 ring-brand-border p-3 hover:ring-neon transition-all"
                style={{ left: n.x, top: n.y }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-7 rounded-md bg-brand-bg ring-1 ring-brand-border flex items-center justify-center">
                    <Icon className="size-3.5 text-neon" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{n.label}</div>
                    <div className="text-[9px] uppercase tracking-widest text-brand-muted">{n.kind}</div>
                  </div>
                </div>
                {n.desc && <div className="text-[10px] text-brand-muted leading-snug">{n.desc}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-brand-border px-8 py-3 text-[10px] uppercase tracking-widest text-brand-muted flex gap-6 shrink-0">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-neon" /> Source</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-fuchsia-400" /> Agent</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-cyan-400" /> Page</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" /> Goal</span>
      </footer>
    </div>
  );
}
