import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Video, Users, Hash, Tv, Plug, Search, Download } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard/apps")({
  head: () => ({ meta: [{ title: "App Store — Algoria" }] }),
  component: AppsPage,
});

export const APP_CATALOG = [
  { id: "whatsapp", name: "WhatsApp", category: "Mensageria", desc: "Envie broadcasts e atenda leads via WhatsApp Business.", icon: MessageCircle, color: "#25D366",
    fields: [
      { key: "phone_number_id", label: "Phone Number ID", placeholder: "1234567890" },
      { key: "access_token", label: "Access Token", placeholder: "EAA…" },
    ] },
  { id: "meet", name: "Google Meet", category: "Reuniões", desc: "Agende chamadas e demos diretamente do chat.", icon: Video, color: "#00897B",
    fields: [
      { key: "client_id", label: "OAuth Client ID", placeholder: "xxx.apps.googleusercontent.com" },
      { key: "client_secret", label: "Client Secret", placeholder: "GOCSPX-…" },
    ] },
  { id: "teams", name: "Microsoft Teams", category: "Colaboração", desc: "Sincronize briefings de campanha com seu time.", icon: Users, color: "#6264A7",
    fields: [
      { key: "tenant_id", label: "Tenant ID", placeholder: "00000000-0000-0000-0000-000000000000" },
      { key: "webhook_url", label: "Incoming Webhook URL", placeholder: "https://outlook.office.com/webhook/…" },
    ] },
  { id: "discord", name: "Discord", category: "Comunidade", desc: "Publique alertas e relatórios em canais da comunidade.", icon: Hash, color: "#5865F2",
    fields: [
      { key: "webhook_url", label: "Webhook URL", placeholder: "https://discord.com/api/webhooks/…" },
    ] },
  { id: "twitch", name: "Twitch", category: "Streaming", desc: "Acompanhe menções de streamers e sobreposição de audiência.", icon: Tv, color: "#9146FF",
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "abc123" },
      { key: "client_secret", label: "Client Secret", placeholder: "•••" },
    ] },
];

function AppsPage() {
  const [q, setQ] = useState("");
  const filtered = APP_CATALOG.filter((a) =>
    !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.category.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-neon/10 ring-1 ring-neon/40 flex items-center justify-center">
            <Plug className="size-5 text-neon" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neon">App Store</div>
            <h1 className="text-xl font-medium tracking-tight">Marketplace de integrações</h1>
            <p className="text-xs text-brand-muted mt-0.5">Instale apps oficiais e configure suas credenciais.</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="size-3.5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar app…"
            className="w-full bg-brand-surface border border-brand-border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-neon transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              className="p-4 rounded-2xl bg-brand-surface border border-brand-border hover:border-neon/60 transition flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="size-11 rounded-xl flex items-center justify-center border"
                  style={{ background: `${app.color}1a`, borderColor: `${app.color}55` }}
                >
                  <Icon className="size-5" style={{ color: app.color }} />
                </div>
                <div>
                  <div className="text-sm font-medium">{app.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-muted">{app.category}</div>
                </div>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed mb-4 flex-1">{app.desc}</p>
              <Link
                to="/dashboard/apps/$id"
                params={{ id: app.id }}
                className="btn-neon-solid text-xs px-3 py-1.5 rounded-lg self-start inline-flex items-center gap-1.5"
              >
                <Download className="size-3.5" /> Instalar
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
