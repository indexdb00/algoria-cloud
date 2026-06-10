import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Video, Users, Hash, Tv, Plug } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/apps")({
  head: () => ({ meta: [{ title: "Apps — Algoria" }] }),
  component: AppsPage,
});

const apps = [
  { id: "whatsapp", name: "WhatsApp", desc: "Send broadcasts and chat with leads via WhatsApp Business.", icon: MessageCircle, color: "#25D366" },
  { id: "meet", name: "Google Meet", desc: "Schedule sales calls and demos from inside Algoria.", icon: Video, color: "#00897B" },
  { id: "teams", name: "Microsoft Teams", desc: "Sync campaign briefings to your team workspace.", icon: Users, color: "#6264A7" },
  { id: "discord", name: "Discord", desc: "Post alerts and reports into community channels.", icon: Hash, color: "#5865F2" },
  { id: "twitch", name: "Twitch", desc: "Track streamer mentions and audience overlap.", icon: Tv, color: "#9146FF" },
];

function AppsPage() {
  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-6xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="size-10 rounded-xl neon-card flex items-center justify-center">
          <Plug className="size-5 text-neon" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest neon-text">Apps</div>
          <h1 className="font-heading text-2xl font-medium tracking-tight">Connect your stack</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border hover:neon-border transition flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="size-11 rounded-xl flex items-center justify-center ring-1"
                  style={{ background: `${app.color}1a`, borderColor: `${app.color}55` }}
                >
                  <Icon className="size-5" style={{ color: app.color }} />
                </div>
                <div className="font-heading text-base font-medium">{app.name}</div>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed mb-4 flex-1">{app.desc}</p>
              <button
                onClick={() => toast.info(`${app.name} connector coming soon`)}
                className="btn-neon-solid text-xs px-3.5 py-2 rounded-lg self-start"
              >
                Conectar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
