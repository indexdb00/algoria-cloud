import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Zap, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  head: () => ({ meta: [{ title: "Billing — Algoria" }] }),
  component: BillingPage,
});

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$5",
    eur: "€5",
    credits: 100,
    features: ["100 credits / month", "5 daily bonus credits", "All 5 agents", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$20",
    eur: "€20",
    credits: 500,
    featured: true,
    features: ["500 credits / month", "5 daily bonus credits", "Priority routing", "All integrations"],
  },
  {
    id: "business",
    name: "Business",
    price: "$50",
    eur: "€50",
    credits: 1500,
    features: ["1,500 credits / month", "Dedicated success engineer", "Custom agents", "SSO + data residency"],
  },
];

function BillingPage() {
  const [country, setCountry] = useState<string>("");

  useEffect(() => {
    supabase.from("profiles").select("country").maybeSingle().then(({ data }) => {
      setCountry((data?.country ?? "").toUpperCase());
    });
  }, []);

  const isBR = country === "BR" || country === "BRASIL" || country === "BRAZIL";

  return (
    <div className="px-5 md:px-10 py-10 md:py-12 max-w-6xl">
      <div className="mb-10">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-3">Plans</div>
        <h1 className="font-heading text-4xl font-medium tracking-tight">Choose your plan</h1>
        <p className="text-sm text-brand-muted mt-3 max-w-xl">
          New accounts get <strong className="text-brand-text">50 free credits</strong> + <strong className="text-brand-text">5 daily</strong>. Upgrade for monthly bundles.
        </p>
        {isBR && (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/15 to-emerald-700/10 ring-1 ring-emerald-500/30 text-xs">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <strong className="text-emerald-300">PIX automático disponível</strong>
            <span className="text-brand-muted">— pague com PIX recorrente direto na assinatura.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {PLANS.map((p) => (
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
            <div className="text-xs uppercase tracking-widest text-brand-muted mb-1">{p.name}</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-4xl font-medium">{p.price}</span>
              <span className="text-xs text-brand-muted">/ {p.eur} per month</span>
            </div>
            <div className="text-sm text-brand-muted mb-6">{p.credits.toLocaleString()} credits / month</div>
            <ul className="space-y-2 mb-6 flex-grow">
              {p.features.map((f) => (
                <li key={f} className="text-xs text-brand-muted flex items-center gap-2">
                  <Check className="size-3.5 text-neon" /> {f}
                </li>
              ))}
              {isBR && (
                <li className="text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-400" /> Pagamento via PIX automático
                </li>
              )}
            </ul>
            <button
              onClick={() => toast.info("Stripe checkout will be enabled shortly — payments are being configured.")}
              className={p.featured ? "btn-neon-solid text-sm py-2.5" : "btn-neon text-sm py-2.5"}
            >
              <CreditCard className="size-4 inline mr-1.5" />
              {isBR ? "Assinar (Cartão / PIX)" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border text-xs text-brand-muted leading-relaxed flex items-start gap-3">
        <Sparkles className="size-4 text-neon shrink-0 mt-0.5" />
        <div>
          Your <strong className="text-brand-text">5 daily credits</strong> refresh every 24h regardless of plan. Monthly plan credits stack on top.
          Brazilian users can pay using <strong className="text-brand-text">PIX automático</strong>; European users use card or SEPA via Stripe.
        </div>
      </div>
    </div>
  );
}
