import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { MessageCircle, Plug2, X, KeyRound, Inbox } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { connectIntegration, disconnectIntegration } from "@/lib/integrations.functions";
import { Tutorial } from "@/components/Tutorial";

export const Route = createFileRoute("/_authenticated/dashboard/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp — Aurevia" }] }),
  component: WhatsAppPage,
});

type Lead = { id: string; phone: string; name: string | null; message: string | null; status: string; created_at: string };

const INTEGRATION_ID = "whatsapp";

function WhatsAppPage() {
  const { t } = useI18n();
  const connectFn = useServerFn(connectIntegration);
  const disconnectFn = useServerFn(disconnectIntegration);
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => { void load(); }, []);

  async function load() {
    const { data: ints } = await supabase
      .from("user_integrations").select("integration_id").eq("integration_id", INTEGRATION_ID).maybeSingle();
    setConnected(!!ints);
    const { data: ls } = await supabase
      .from("whatsapp_leads").select("*").order("created_at", { ascending: false }).limit(50);
    setLeads((ls ?? []) as Lead[]);
  }

  async function submit() {
    const fields = ["phone_number_id", "access_token", "webhook_verify_token"];
    const missing = fields.find((k) => !(values[k] ?? "").trim());
    if (missing) { toast.error(`${missing} ${t("int.form.required")}`); return; }
    setSubmitting(true);
    try {
      const res = await connectFn({ data: { integrationId: INTEGRATION_ID, name: "WhatsApp Business", credentials: values } });
      if (res?.error) { toast.error(res.error); return; }
      setConnected(true);
      setOpen(false);
      toast.success(`WhatsApp · ${t("int.form.costNote")}`);
    } finally { setSubmitting(false); }
  }

  async function disconnect() {
    await disconnectFn({ data: { integrationId: INTEGRATION_ID } });
    setConnected(false);
    toast.success(`WhatsApp ${t("int.disconnected")}`);
  }

  return (
    <div className="px-5 md:px-10 py-10 md:py-14 max-w-6xl">
      <Tutorial
        id="whatsapp-v1"
        title="WhatsApp"
        steps={[
          { title: t("wa.tour1.title"), body: t("wa.tour1.body") },
          { title: t("wa.tour2.title"), body: t("wa.tour2.body") },
        ]}
      />

      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neon mb-2">{t("wa.tag")}</div>
          <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">{t("wa.title")}</h1>
          <p className="text-sm text-brand-muted mt-2 max-w-xl">{t("wa.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#075E54] flex items-center justify-center shadow-[0_10px_30px_-10px_#25D366] ring-1 ring-white/10">
            <MessageCircle className="size-7 text-white" />
          </div>
        </div>
      </div>

      {/* Status / connect card */}
      <div className={"mb-8 p-6 rounded-2xl bg-brand-surface ring-1 transition-all " + (connected ? "ring-neon/60 shadow-[0_0_30px_-12px_var(--neon)]" : "ring-brand-border")}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className={"size-2.5 rounded-full " + (connected ? "bg-neon shadow-[0_0_10px_var(--neon)]" : "bg-brand-muted")} />
            <div>
              <div className="font-medium text-sm">{connected ? t("int.connected") : t("int.notConnected")}</div>
              <div className="text-[10px] uppercase tracking-widest text-brand-muted mt-0.5 flex items-center gap-1.5">
                <KeyRound className="size-3" /> {t("int.form.costNote")}
              </div>
            </div>
          </div>
          {connected ? (
            <button onClick={disconnect} className="btn-dark text-xs px-3 py-2 rounded-lg">{t("int.disconnect")}</button>
          ) : (
            <button onClick={() => setOpen(true)} className="btn-neon-solid text-xs px-4 py-2 inline-flex items-center gap-1.5 rounded-lg">
              <Plug2 className="size-3" /> {t("int.connect")}
            </button>
          )}
        </div>
      </div>

      {/* Leads */}
      <div className="rounded-2xl bg-brand-surface ring-1 ring-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="size-4 text-neon" />
            <span className="font-medium text-sm">{t("wa.leads")}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-brand-muted">{leads.length}</span>
        </div>
        {leads.length === 0 ? (
          <div className="px-5 py-12 text-center text-xs text-brand-muted">
            {connected ? t("wa.leads.emptyConnected") : t("wa.leads.emptyDisconnected")}
          </div>
        ) : (
          <ul className="divide-y divide-brand-border">
            {leads.map((l) => (
              <li key={l.id} className="px-5 py-3 flex items-center gap-3">
                <div className="size-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#075E54] flex items-center justify-center text-white font-medium text-xs">
                  {(l.name ?? l.phone).slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{l.name || l.phone}</div>
                  <div className="text-[11px] text-brand-muted truncate">{l.message || l.phone}</div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand-muted">{l.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !submitting && setOpen(false)}>
          <div className="w-full max-w-md bg-brand-surface ring-1 ring-brand-border rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#075E54] flex items-center justify-center">
                  <MessageCircle className="size-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">{t("int.form.title")} WhatsApp</div>
                  <div className="text-[10px] uppercase tracking-widest text-neon">{t("int.form.costNote")}</div>
                </div>
              </div>
              <button onClick={() => !submitting && setOpen(false)} className="text-brand-muted hover:text-brand-text"><X className="size-4" /></button>
            </div>
            <p className="text-xs text-brand-muted mt-3 mb-5">{t("wa.form.subtitle")}</p>
            <div className="space-y-3">
              {[
                { k: "phone_number_id", label: "Phone Number ID", placeholder: "1067xxxxx" },
                { k: "access_token", label: "Access Token", placeholder: "EAAB…", type: "password" as const },
                { k: "webhook_verify_token", label: "Webhook Verify Token", placeholder: "my-verify-token" },
              ].map((f) => (
                <label key={f.k} className="block">
                  <span className="text-[10px] uppercase tracking-widest text-brand-muted mb-1 block">{f.label}</span>
                  <input
                    type={f.type ?? "text"}
                    autoComplete="off"
                    value={values[f.k] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.k]: e.target.value })}
                    placeholder={f.placeholder}
                    className="input-base"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setOpen(false)} disabled={submitting} className="btn-dark text-xs px-3 py-2">{t("int.form.cancel")}</button>
              <button onClick={submit} disabled={submitting} className="btn-neon-solid text-xs px-4 py-2 inline-flex items-center gap-1.5">
                <Plug2 className="size-3" />
                {submitting ? "…" : t("int.form.submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
