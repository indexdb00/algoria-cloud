import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Check, X, KeyRound, Plug2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { connectIntegration, disconnectIntegration } from "@/lib/integrations.functions";
import { Tutorial } from "@/components/Tutorial";

export const Route = createFileRoute("/_authenticated/dashboard/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Aurevia" }] }),
  component: IntegrationsPage,
});

type Field = { key: string; label: string; placeholder: string; type?: "text" | "password" };

type Integration = {
  id: string;
  name: string;
  color: string;
  initials: string;
  desc: Record<string, string>;
  scopes: readonly string[];
  fields: Field[];
};

const INTEGRATIONS: readonly Integration[] = [
  {
    id: "meta-ads", name: "Meta Ads", color: "#1877F2", initials: "M",
    desc: { en: "Facebook + Instagram campaigns and retargeting.", pt: "Campanhas Facebook + Instagram e retargeting.", es: "Campañas Facebook + Instagram y retargeting.", fr: "Campagnes Facebook + Instagram et retargeting.", de: "Facebook + Instagram Kampagnen und Retargeting.", it: "Campagne Facebook + Instagram e retargeting." },
    scopes: ["ads_management", "business_management"],
    fields: [
      { key: "ad_account_id", label: "Ad Account ID", placeholder: "act_1234567890" },
      { key: "access_token", label: "Access Token", placeholder: "EAAB…", type: "password" },
    ],
  },
  {
    id: "business-suite", name: "Meta Business Suite", color: "#0866FF", initials: "B",
    desc: { en: "Page inbox and scheduled posts.", pt: "Caixa da página e posts agendados.", es: "Bandeja de página y posts programados.", fr: "Boîte de réception page et posts planifiés.", de: "Page-Inbox und geplante Posts.", it: "Inbox pagina e post programmati." },
    scopes: ["pages_messaging", "pages_manage_posts"],
    fields: [
      { key: "page_id", label: "Page ID", placeholder: "1010100000" },
      { key: "page_access_token", label: "Page Access Token", placeholder: "EAAB…", type: "password" },
    ],
  },
  {
    id: "google-ads", name: "Google Ads", color: "#FBBC04", initials: "G",
    desc: { en: "Search, Performance Max & YouTube.", pt: "Search, Performance Max e YouTube.", es: "Search, Performance Max y YouTube.", fr: "Search, Performance Max & YouTube.", de: "Search, Performance Max & YouTube.", it: "Search, Performance Max e YouTube." },
    scopes: ["adwords"],
    fields: [
      { key: "customer_id", label: "Customer ID", placeholder: "123-456-7890" },
      { key: "developer_token", label: "Developer Token", placeholder: "ya29…", type: "password" },
      { key: "refresh_token", label: "Refresh Token", placeholder: "1//0g…", type: "password" },
    ],
  },
  {
    id: "google-analytics", name: "Google Analytics 4", color: "#E37400", initials: "A",
    desc: { en: "Attribution and conversion data.", pt: "Atribuição e conversões.", es: "Atribución y conversiones.", fr: "Données d'attribution et de conversion.", de: "Attribution und Conversion-Daten.", it: "Dati di attribuzione e conversione." },
    scopes: ["analytics.readonly"],
    fields: [
      { key: "property_id", label: "Property ID", placeholder: "123456789" },
      { key: "service_account_json", label: "Service Account JSON", placeholder: '{"type":"service_account",…}', type: "password" },
    ],
  },
  {
    id: "tiktok-ads", name: "TikTok Ads", color: "#FF0050", initials: "T",
    desc: { en: "Spark Ads, Shop ads and UGC cycles.", pt: "Spark Ads, anúncios Shop e ciclos UGC.", es: "Spark Ads, anuncios Shop y ciclos UGC.", fr: "Spark Ads, annonces Shop et cycles UGC.", de: "Spark Ads, Shop-Anzeigen und UGC-Zyklen.", it: "Spark Ads, annunci Shop e cicli UGC." },
    scopes: ["tiktok_ads.read", "tiktok_ads.write"],
    fields: [
      { key: "advertiser_id", label: "Advertiser ID", placeholder: "7000000000000000000" },
      { key: "access_token", label: "Access Token", placeholder: "TT-…", type: "password" },
    ],
  },
  {
    id: "bidmachine", name: "BidMachine", color: "#7C3AED", initials: "B",
    desc: { en: "Programmatic in-app and CTV inventory.", pt: "Inventário programático in-app e CTV.", es: "Inventario programático in-app y CTV.", fr: "Inventaire programmatique in-app et CTV.", de: "Programmatisches In-App- und CTV-Inventar.", it: "Inventario programmatico in-app e CTV." },
    scopes: ["bidmachine.read", "bidmachine.write"],
    fields: [
      { key: "seller_id", label: "Seller ID", placeholder: "bm_seller_123" },
      { key: "api_key", label: "API Key", placeholder: "bm_live_…", type: "password" },
    ],
  },
  {
    id: "whatsapp", name: "WhatsApp Business", color: "#25D366", initials: "W",
    desc: { en: "Capture and qualify leads via WhatsApp.", pt: "Capture e qualifique leads pelo WhatsApp.", es: "Captura y califica leads vía WhatsApp.", fr: "Capturez et qualifiez les leads via WhatsApp.", de: "Leads über WhatsApp erfassen und qualifizieren.", it: "Cattura e qualifica lead via WhatsApp." },
    scopes: ["whatsapp_business_messaging"],
    fields: [
      { key: "phone_number_id", label: "Phone Number ID", placeholder: "1067xxxxx" },
      { key: "access_token", label: "Access Token", placeholder: "EAAB…", type: "password" },
      { key: "webhook_verify_token", label: "Webhook Verify Token", placeholder: "my-verify-token" },
    ],
  },
];

function IntegrationsPage() {
  const { t, lang } = useI18n();
  const connectFn = useServerFn(connectIntegration);
  const disconnectFn = useServerFn(disconnectIntegration);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("user_integrations").select("integration_id").then(({ data }) => {
      if (!data) return;
      const map: Record<string, boolean> = {};
      data.forEach((r) => { map[r.integration_id] = true; });
      setConnected(map);
    });
  }, []);

  const current = INTEGRATIONS.find((i) => i.id === openId) ?? null;

  function openConnect(i: Integration) {
    setOpenId(i.id);
    setValues({});
  }

  async function submit() {
    if (!current) return;
    const missing = current.fields.find((f) => !(values[f.key] ?? "").trim());
    if (missing) { toast.error(`${missing.label} ${t("int.form.required")}`); return; }
    setSubmitting(true);
    try {
      const res = await connectFn({ data: { integrationId: current.id, name: current.name, credentials: values } });
      if (res?.error) { toast.error(res.error); return; }
      setConnected((c) => ({ ...c, [current.id]: true }));
      toast.success(`${current.name} · ${t("int.form.costNote")}`);
      setOpenId(null);
    } finally { setSubmitting(false); }
  }

  async function disconnect(id: string, name: string) {
    await disconnectFn({ data: { integrationId: id } });
    setConnected((c) => ({ ...c, [id]: false }));
    toast.success(`${name} ${t("int.disconnected")}`);
  }

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-6xl">
      <Tutorial
        id="integrations-v2"
        title="Integrations tour"
        steps={[
          { title: "Pick a platform", body: "Each card is a real ad network we manage for you. Click Connect to open the credential form — nothing happens until you save." },
          { title: "Fill your credentials", body: "Paste the API keys / tokens from the platform's developer dashboard. Aurevia encrypts them at rest and never exposes them in chat." },
          { title: "Pay 5 credits to wire it up", body: "Saving deducts 5 credits and unlocks that integration inside the chat and funnel — the agent can then launch real campaigns on it." },
        ]}
      />
      <div className="mb-10">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-3">Connections</div>
        <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">{t("int.title")}</h1>
        <p className="text-sm text-brand-muted mt-3 max-w-2xl">{t("int.subtitle")}</p>
        <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-neon">
          <KeyRound className="size-3" />
          {t("int.form.costNote")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((i) => {
          const isConnected = !!connected[i.id];
          return (
            <div key={i.id}
              className={"relative overflow-hidden p-6 rounded-2xl bg-brand-surface ring-1 transition-all " +
                (isConnected ? "ring-neon/60 shadow-[0_0_30px_-12px_var(--neon)]" : "ring-brand-border hover:ring-neon/40")}>
              <div className="absolute -top-20 -right-20 size-48 rounded-full blur-3xl pointer-events-none opacity-30" style={{ background: i.color }} />
              <div className="relative flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl ring-1 ring-brand-border flex items-center justify-center font-semibold text-sm text-white shrink-0" style={{ background: i.color }}>{i.initials}</div>
                  <div>
                    <div className="font-medium text-sm">{i.name}</div>
                    <div className="text-[10px] uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <span className={"size-1.5 rounded-full " + (isConnected ? "bg-neon shadow-[0_0_6px_var(--neon)]" : "bg-brand-muted")} />
                      <span className={isConnected ? "text-neon" : "text-brand-muted"}>
                        {isConnected ? t("int.connected") : t("int.notConnected")}
                      </span>
                    </div>
                  </div>
                </div>
                {isConnected ? (
                  <button onClick={() => disconnect(i.id, i.name)} className="btn-dark text-xs px-3 py-1.5 inline-flex items-center gap-1.5 shrink-0">
                    <Check className="size-3 text-neon" />{t("int.disconnect")}
                  </button>
                ) : (
                  <button onClick={() => openConnect(i)} className="btn-neon text-xs px-3 py-1.5 inline-flex items-center gap-1.5 shrink-0">
                    <Plug2 className="size-3" />{t("int.connect")}
                  </button>
                )}
              </div>
              <p className="relative text-xs text-brand-muted leading-relaxed mb-4">
                {i.desc[lang] ?? i.desc.en}
              </p>
              <div className="relative flex flex-wrap gap-1.5">
                {i.scopes.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-brand-bg ring-1 ring-brand-border text-brand-muted">{s}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect form modal */}
      {current && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !submitting && setOpenId(null)}>
          <div className="w-full max-w-md bg-brand-surface ring-1 ring-brand-border rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl ring-1 ring-brand-border flex items-center justify-center font-semibold text-sm text-white" style={{ background: current.color }}>{current.initials}</div>
                <div>
                  <div className="font-medium">{t("int.form.title")} {current.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-neon">{t("int.form.costNote")}</div>
                </div>
              </div>
              <button onClick={() => !submitting && setOpenId(null)} className="text-brand-muted hover:text-brand-text"><X className="size-4" /></button>
            </div>
            <p className="text-xs text-brand-muted mt-3 mb-5">{t("int.form.subtitle")}</p>
            <div className="space-y-3">
              {current.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-[10px] uppercase tracking-widest text-brand-muted mb-1 block">{f.label}</span>
                  <input
                    type={f.type ?? "text"}
                    autoComplete="off"
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="input-base"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setOpenId(null)} disabled={submitting} className="btn-dark text-xs px-3 py-2">{t("int.form.cancel")}</button>
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
