import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Zap, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  head: () => ({ meta: [{ title: "Billing — Aurevia" }] }),
  component: BillingPage,
});

const PACKS = [
  { id: "starter", credits: 500, price: "€19", per: "€0.038 / credit", features: ["2 active agents", "Weekly performance reports", "Email support"] },
  { id: "growth", credits: 2500, price: "€59", per: "€0.024 / credit", featured: true, features: ["All 5 agents", "Daily performance pulse", "All 6 integrations", "Priority routing"] },
  { id: "scale", credits: 12000, price: "€199", per: "€0.017 / credit", features: ["Custom agents", "Dedicated success engineer", "SSO + data residency"] },
];

function BillingPage() {
  return (
    <div className="px-10 py-12 max-w-6xl">
      <div className="mb-10">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-3">Billing & Credits</div>
        <h1 className="font-heading text-4xl font-medium tracking-tight">Top up your workspace</h1>
        <p className="text-sm text-brand-muted mt-3 max-w-xl">
          Credits power every agent action and every conversion you ship. Pay-as-you-go via Stripe — no contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {PACKS.map((p) => (
          <div
            key={p.id}
            className={
              "p-6 rounded-2xl flex flex-col " +
              (p.featured
                ? "bg-brand-surface ring-1 ring-neon shadow-[0_0_40px_-12px_var(--neon)]"
                : "bg-brand-surface ring-1 ring-brand-border")
            }
          >
            {p.featured && (
              <span className="self-start text-[10px] uppercase tracking-widest text-neon mb-3 inline-flex items-center gap-1">
                <Zap className="size-3" /> Most popular
              </span>
            )}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-4xl font-medium">{p.price}</span>
              <span className="text-xs text-brand-muted">one-time</span>
            </div>
            <div className="text-sm text-brand-muted mb-1">{p.credits.toLocaleString()} credits</div>
            <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-6">{p.per}</div>
            <ul className="space-y-2 mb-6 flex-grow">
              {p.features.map((f) => (
                <li key={f} className="text-xs text-brand-muted flex items-center gap-2">
                  <Check className="size-3.5 text-neon" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => toast.info("Connect Stripe to enable checkout — Settings → Payments.")}
              className={p.featured ? "btn-neon-solid text-sm py-2" : "btn-neon text-sm py-2"}
            >
              <CreditCard className="size-4 inline mr-1.5" /> Buy credits
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border text-xs text-brand-muted leading-relaxed">
        Stripe checkout activates once payments are enabled on this workspace. Until then you can keep iterating with your 100 welcome credits.
      </div>
    </div>
  );
}
