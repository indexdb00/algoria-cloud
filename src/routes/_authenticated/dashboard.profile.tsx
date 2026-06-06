import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { ShieldCheck, User as UserIcon, Building2, Calendar, MapPin, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — Aurevia" }] }),
  component: ProfilePage,
});

type Form = {
  display_name: string;
  birth_date: string;
  company: string;
  country: string;
  state: string;
  city: string;
};

const EMPTY: Form = { display_name: "", birth_date: "", company: "", country: "", state: "", city: "" };

function ProfilePage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setEmail(u.user?.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("display_name,birth_date,company,country,state,city")
        .maybeSingle();
      if (data) {
        setForm({
          display_name: data.display_name ?? "",
          birth_date: data.birth_date ?? "",
          company: data.company ?? "",
          country: data.country ?? "",
          state: data.state ?? "",
          city: data.city ?? "",
        });
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSaving(false); return; }
    const payload = {
      id: u.user.id,
      display_name: form.display_name || null,
      birth_date: form.birth_date || null,
      company: form.company || null,
      country: form.country || null,
      state: form.state || null,
      city: form.city || null,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("profile.saved"));
  }

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-3xl">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-3">{t("dash.profile")}</div>
        <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">{t("profile.title")}</h1>
        <p className="text-sm text-brand-muted mt-3 max-w-xl">{t("profile.subtitle")}</p>
      </div>

      {/* Security balloon */}
      <div className="relative mb-8 rounded-2xl bg-brand-surface ring-1 ring-neon/40 p-5 flex gap-3 shadow-[0_0_30px_-12px_var(--neon)]">
        <div className="size-9 rounded-xl icon-3d flex items-center justify-center shrink-0">
          <ShieldCheck className="size-4 text-[oklch(0.16_0.01_160)]" />
        </div>
        <div className="text-xs leading-relaxed text-brand-text">
          <div className="font-medium text-neon mb-1">{t("profile.security.title")}</div>
          <p className="text-brand-muted">{t("profile.security.body")}</p>
        </div>
        <span className="absolute -top-2 left-7 size-3 rotate-45 bg-brand-surface ring-1 ring-neon/40" />
      </div>

      {loading ? (
        <div className="text-xs text-brand-muted">{t("funnel.loading")}</div>
      ) : (
        <div className="space-y-5">
          <Field icon={<UserIcon className="size-3.5" />} label={t("profile.field.name")}>
            <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="input-base" />
          </Field>

          <Field icon={<Calendar className="size-3.5" />} label={t("profile.field.dob")}>
            <input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} className="input-base" />
          </Field>

          <Field icon={<Building2 className="size-3.5" />} label={t("profile.field.company")}>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-base" placeholder="Aurevia Intelligence" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field icon={<MapPin className="size-3.5" />} label={t("profile.field.country")}>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-base" placeholder="Portugal" />
            </Field>
            <Field icon={<MapPin className="size-3.5" />} label={t("profile.field.state")}>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-base" placeholder="Lisboa" />
            </Field>
            <Field icon={<MapPin className="size-3.5" />} label={t("profile.field.city")}>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-base" placeholder="Lisbon" />
            </Field>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-brand-muted truncate">{email}</span>
            <button onClick={save} disabled={saving} className="btn-neon-solid text-sm py-2 px-4 inline-flex items-center gap-2 disabled:opacity-60">
              <Save className="size-3.5" />
              {saving ? "…" : t("profile.save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-brand-muted flex items-center gap-1.5 mb-1.5">
        <span className="text-neon">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}
