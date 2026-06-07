import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/admin/payments")({
  component: AdminPayments,
});

function AdminPayments() {
  return (
    <div className="space-y-4">
      <div className="p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border">
        <div className="flex items-start gap-3 mb-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center ring-1 ring-white/10">
            <CreditCard className="size-5 text-white" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-medium">Stripe payments</h2>
            <p className="text-xs text-brand-muted mt-1">Subscriptions, invoices, refunds and PIX (Brazil) management.</p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-brand-bg ring-1 ring-brand-border flex items-start gap-3">
          <AlertCircle className="size-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-brand-muted leading-relaxed">
            <strong className="text-brand-text">Stripe is not connected yet.</strong> Enable Lovable Payments (Stripe) to surface live MRR, active subscriptions, refund actions and Brazilian PIX checkout on this tab. PIX automatic appears as a payment method for BRL plans once enabled.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "MRR", value: "—" },
          { label: "Active subs", value: "—" },
          { label: "Churn (30d)", value: "—" },
        ].map((k) => (
          <div key={k.label} className="p-4 rounded-2xl bg-brand-surface ring-1 ring-brand-border">
            <div className="font-heading text-2xl font-medium tracking-tight tabular-nums">{k.value}</div>
            <div className="text-[11px] text-brand-muted mt-1">{k.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
