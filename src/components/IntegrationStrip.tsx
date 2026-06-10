import { MessageCircle, Video, Users, Hash, Tv } from "lucide-react";

const apps = [
  { name: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  { name: "Google Meet", icon: Video, color: "#00897B" },
  { name: "Microsoft Teams", icon: Users, color: "#6264A7" },
  { name: "Discord", icon: Hash, color: "#5865F2" },
  { name: "Twitch", icon: Tv, color: "#9146FF" },
];

export function IntegrationStrip() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-[10px] uppercase tracking-widest text-brand-muted text-center mb-3">
        Connect your favorite apps
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {apps.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.name}
              className="group flex items-center gap-2 px-3 py-2 rounded-full bg-brand-surface ring-1 ring-brand-border hover:neon-border transition cursor-default"
              title={a.name}
            >
              <Icon className="size-4 transition" style={{ color: a.color }} />
              <span className="text-xs text-brand-muted group-hover:text-brand-text transition">{a.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
