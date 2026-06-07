import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { abstractAvatarDataUrl } from "@/lib/avatar";
import { Tutorial } from "@/components/Tutorial";
import { Save, RefreshCw, Database, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — Aurevia" }] }),
  component: ProfilePage,
});

const BIO_KEY = "aurevia.bio";
const AVATAR_SEED_KEY = "aurevia.avatarSeed";

type Form = { display_name: string; bio: string };

const PLAN_STORAGE = {
  free: { label: "Free", limit: "30 days history · max 20 conversations" },
  growth: { label: "Growth", limit: "12 months history · unlimited conversations" },
  scale: { label: "Scale", limit: "Unlimited history · unlimited conversations" },
} as const;

function ProfilePage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState<Form>({ display_name: "", bio: "" });
  const [avatarSeed, setAvatarSeed] = useState<string>("aurevia");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan] = useState<keyof typeof PLAN_STORAGE>("free");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? "";
      setEmail(u.user?.email ?? "");
      setUserId(uid);
      const { data } = await supabase.from("profiles").select("display_name").maybeSingle();
      const bio = (typeof window !== "undefined" && localStorage.getItem(BIO_KEY)) || "";
      const seed = (typeof window !== "undefined" && localStorage.getItem(AVATAR_SEED_KEY)) || uid;
      setForm({ display_name: data?.display_name ?? "", bio });
      setAvatarSeed(seed);
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSaving(false); return; }
    const { error } = await supabase.from("profiles").upsert(
      { id: u.user.id, display_name: form.display_name || null },
      { onConflict: "id" },
    );
    try { localStorage.setItem(BIO_KEY, form.bio); localStorage.setItem(AVATAR_SEED_KEY, avatarSeed); } catch { /* ignore */ }
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("profile.saved"));
  }

  function randomizeAvatar() {
    const s = Math.random().toString(36).slice(2) + Date.now();
    setAvatarSeed(s);
  }

  const planInfo = PLAN_STORAGE[plan];
  const avatar = abstractAvatarDataUrl(avatarSeed, 160);

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-2xl">
      <Tutorial
        id="profile-v2"
        title={t("tut.profile.title")}
        steps={[
          { title: t("tut.profile.s1.title"), body: t("tut.profile.s1.body") },
          { title: t("tut.profile.s2.title"), body: t("tut.profile.s2.body") },
          { title: t("tut.profile.s3.title"), body: t("tut.profile.s3.body") },
        ]}
      />

      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-3">{t("dash.profile")}</div>
        <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">{t("profile.title")}</h1>
        <p className="text-sm text-brand-muted mt-3 max-w-xl">{t("profile.subtitle")}</p>
      </div>

      {loading ? (
        <div className="text-xs text-brand-muted">…</div>
      ) : (
        <div className="space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border">
            <img src={avatar} alt="" className="size-20 rounded-2xl ring-1 ring-brand-border" />
            <div className="flex-1 min-w-0">
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-brand-muted mb-1.5 block">{t("profile.field.username")}</span>
                <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="input-base" placeholder="aurevia_user" />
              </label>
              <button onClick={randomizeAvatar} className="mt-2 text-[11px] inline-flex items-center gap-1.5 text-brand-muted hover:text-neon">
                <RefreshCw className="size-3" /> {t("profile.regen")}
              </button>
            </div>
          </div>

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-muted mb-1.5 block">{t("profile.field.bio")}</span>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="input-base min-h-[110px]"
              placeholder={t("profile.bio.placeholder")}
              maxLength={500}
            />
            <span className="text-[10px] text-brand-muted mt-1 block">{form.bio.length}/500</span>
          </label>

          {/* Storage / plan */}
          <div className="p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl icon-3d flex items-center justify-center shrink-0">
                <Database className="size-4" style={{ color: "var(--primary-foreground)" }} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-neon">{t("profile.storage.tag")}</div>
                <div className="font-medium mt-0.5">{t("profile.storage.title")} · {planInfo.label}</div>
                <p className="text-xs text-brand-muted mt-1">{planInfo.limit}</p>
                <p className="text-[11px] text-brand-muted mt-2">{t("profile.storage.note")}</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-brand-muted flex items-center gap-2">
            <ShieldCheck className="size-3 text-neon" />
            {email}
          </div>

          <div className="pt-2 flex justify-end">
            <button onClick={save} disabled={saving} className="btn-neon-solid text-sm py-2.5 px-5 inline-flex items-center gap-2 disabled:opacity-60">
              <Save className="size-3.5" />
              {saving ? "…" : t("profile.save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
