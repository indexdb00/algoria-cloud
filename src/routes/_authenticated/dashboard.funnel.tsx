import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, GitBranch, Trash2, Pencil, Check, X, FolderOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/funnel")({
  head: () => ({ meta: [{ title: "Funnels — Aurevia" }] }),
  component: Funnels,
});

type Funnel = {
  id: string;
  name: string;
  description: string;
  stages: string[];
  createdAt: number;
};

const STORE_KEY = "aurevia.funnels.v1";
const DEFAULT_STAGES = ["Awareness", "Consideration", "Conversion", "Retention"];

function Funnels() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDesc, setDraftDesc] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setFunnels(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(funnels));
  }, [funnels]);

  function create() {
    const f: Funnel = {
      id: crypto.randomUUID(),
      name: "Untitled funnel",
      description: "",
      stages: [...DEFAULT_STAGES],
      createdAt: Date.now(),
    };
    setFunnels((p) => [f, ...p]);
    setEditing(f.id);
    setDraftName(f.name);
    setDraftDesc("");
  }

  function remove(id: string) {
    setFunnels((p) => p.filter((f) => f.id !== id));
  }

  function startEdit(f: Funnel) {
    setEditing(f.id);
    setDraftName(f.name);
    setDraftDesc(f.description);
  }

  function saveEdit(id: string) {
    setFunnels((p) => p.map((f) => f.id === id ? { ...f, name: draftName || "Untitled funnel", description: draftDesc } : f));
    setEditing(null);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-brand-border px-6 md:px-10 py-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neon mb-1">Funnels</div>
          <h1 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">Your funnel boards</h1>
          <p className="text-xs md:text-sm text-brand-muted mt-1 max-w-xl">
            Create a board per project. Name each funnel and let your agents fill the stages with assets, audiences and creatives.
          </p>
        </div>
        <button onClick={create} className="btn-neon-solid text-sm px-3 py-2 inline-flex items-center gap-1.5 shrink-0">
          <Plus className="size-4" /> <span className="hidden sm:inline">New funnel</span>
        </button>
      </header>

      <div className="flex-1 px-6 md:px-10 py-8">
        {funnels.length === 0 ? (
          <div className="border border-dashed border-brand-border rounded-2xl py-20 px-6 text-center max-w-2xl mx-auto">
            <div className="size-12 mx-auto rounded-xl bg-brand-surface ring-1 ring-brand-border flex items-center justify-center mb-4">
              <FolderOpen className="size-5 text-neon" />
            </div>
            <h2 className="font-heading text-xl font-medium mb-2">No funnels yet</h2>
            <p className="text-sm text-brand-muted max-w-md mx-auto mb-6">
              This space stays empty until you create your first board. Each funnel is private and persists across sessions.
            </p>
            <button onClick={create} className="btn-neon text-sm px-4 py-2 inline-flex items-center gap-2">
              <Plus className="size-4" /> Create your first funnel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {funnels.map((f) => (
              <article
                key={f.id}
                className="group p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="size-9 rounded-lg bg-brand-bg ring-1 ring-brand-border flex items-center justify-center shrink-0">
                    <GitBranch className="size-4 text-neon" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    {editing === f.id ? (
                      <>
                        <button onClick={() => saveEdit(f.id)} className="btn-neon p-1.5"><Check className="size-3.5" /></button>
                        <button onClick={() => setEditing(null)} className="btn-dark p-1.5"><X className="size-3.5" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(f)} className="btn-dark p-1.5"><Pencil className="size-3.5" /></button>
                        <button onClick={() => remove(f.id)} className="btn-dark p-1.5 hover:!text-red-400"><Trash2 className="size-3.5" /></button>
                      </>
                    )}
                  </div>
                </div>

                {editing === f.id ? (
                  <div className="space-y-2 mb-4">
                    <input
                      autoFocus
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Funnel name"
                      className="w-full bg-brand-bg ring-1 ring-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-neon"
                    />
                    <textarea
                      value={draftDesc}
                      onChange={(e) => setDraftDesc(e.target.value)}
                      placeholder="What is this funnel for?"
                      rows={2}
                      className="w-full bg-brand-bg ring-1 ring-brand-border rounded-md px-3 py-2 text-xs text-brand-muted focus:outline-none focus:ring-neon resize-none"
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <h3 className="font-medium text-sm mb-1">{f.name}</h3>
                    <p className="text-xs text-brand-muted line-clamp-2 min-h-[2rem]">
                      {f.description || "No description yet."}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  {f.stages.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="size-1.5 rounded-full bg-neon/70 shadow-[0_0_6px_var(--neon)]" />
                      <span className="text-brand-muted">{s}</span>
                      <span className="ml-auto text-[10px] uppercase tracking-widest text-brand-muted/60">empty</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
