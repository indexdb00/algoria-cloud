import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/admin/support")({
  component: AdminSupport,
});

type Row = {
  id: string; protocol: string; subject: string; status: string;
  user_id: string; last_message_at: string;
};

function AdminSupport() {
  const [rows, setRows] = useState<Row[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("support_tickets")
        .select("id,protocol,subject,status,user_id,last_message_at")
        .order("last_message_at", { ascending: false }).limit(200);
      const r = (data ?? []) as Row[];
      setRows(r);
      const ids = Array.from(new Set(r.map((x) => x.user_id)));
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id,display_name").in("id", ids);
        const map: Record<string, string> = {};
        (profs ?? []).forEach((p: { id: string; display_name: string | null }) => { map[p.id] = p.display_name ?? p.id.slice(0, 8); });
        setNames(map);
      }
    })();
  }, []);

  const STATUS: Record<string, string> = {
    open: "text-sky-300", pending: "text-amber-300", resolved: "text-emerald-300", closed: "text-brand-muted",
  };

  return (
    <div className="space-y-2">
      <h2 className="font-heading text-xl font-medium tracking-tight mb-4">All support tickets</h2>
      {rows.length === 0 ? (
        <div className="text-sm text-brand-muted py-8 text-center">No tickets yet.</div>
      ) : rows.map((r) => (
        <Link key={r.id} to="/dashboard/admin/support/$id" params={{ id: r.id }}
          className="block p-4 rounded-xl bg-brand-surface ring-1 ring-brand-border hover:ring-amber-500/40 transition">
          <div className="flex items-center gap-3 mb-1">
            <MessageSquare className="size-3.5 text-amber-400" />
            <span className="font-mono text-[11px] text-brand-muted">{r.protocol}</span>
            <span className={"ml-auto text-[10px] uppercase tracking-widest " + (STATUS[r.status] || "")}>{r.status}</span>
          </div>
          <div className="font-medium text-sm truncate">{r.subject}</div>
          <div className="text-[11px] text-brand-muted mt-1">
            {names[r.user_id] || r.user_id.slice(0, 8)} · {new Date(r.last_message_at).toLocaleString()}
          </div>
        </Link>
      ))}
    </div>
  );
}
