import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { APP_CATALOG } from "./dashboard.apps";
import { connectIntegration } from "@/lib/integrations.functions";

export const Route = createFileRoute("/_authenticated/dashboard/apps/$id")({
  head: () => ({ meta: [{ title: "Configurar app — Algoria" }] }),
  component: AppConfig,
});

function AppConfig() {
  const { id } = useParams({ from: "/_authenticated/dashboard/apps/$id" });
  const navigate = useNavigate();
  const connect = useServerFn(connectIntegration);
  const app = APP_CATALOG.find((a) => a.id === id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!app) {
    return (
      <div className="p-10 text-sm text-brand-muted">
        App não encontrado. <Link to="/dashboard/apps" className="text-neon">Voltar à store</Link>
      </div>
    );
  }
  const Icon = app.icon;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!app) return;
    const missing = app.fields.find((f) => !values[f.key]?.trim());
    if (missing) { toast.error(`Preencha ${missing.label}`); return; }
    setSaving(true);
    try {
      const res = await connect({ data: { integrationId: app.id, name: app.name, credentials: values } });
      if (res.error) toast.error(res.error);
      else { toast.success(`${app.name} conectado`); navigate({ to: "/dashboard/apps" }); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao conectar");
    } finally { setSaving(false); }
  }

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-2xl">
      <Link to="/dashboard/apps" className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-text mb-6">
        <ArrowLeft className="size-3.5" /> Voltar à store
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div
          className="size-12 rounded-2xl flex items-center justify-center border"
          style={{ background: `${app.color}1a`, borderColor: `${app.color}55` }}
        >
          <Icon className="size-6" style={{ color: app.color }} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neon">{app.category}</div>
          <h1 className="text-2xl font-medium tracking-tight">{app.name}</h1>
        </div>
      </div>

      <p className="text-sm text-brand-muted mb-6">{app.desc}</p>

      <form onSubmit={save} className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <div className="text-[10px] uppercase tracking-widest text-brand-muted">Credenciais</div>
        {app.fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium block mb-1.5">{f.label}</label>
            <input
              type={f.key.includes("secret") || f.key.includes("token") ? "password" : "text"}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon transition"
            />
          </div>
        ))}

        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="text-[11px] text-brand-muted">Custo: <span className="text-neon">5 créditos</span> para conectar.</div>
          <button
            type="submit"
            disabled={saving}
            className="btn-neon-solid text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            {saving ? "Conectando…" : "Conectar e instalar"}
          </button>
        </div>
      </form>
    </div>
  );
}
