import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Aurevia" }, { name: "description", content: "Sign in or create your Aurevia account." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined,
            data: { display_name: name || email.split("@")[0], language: lang },
          },
        });
        if (error) throw error;
        toast.success(t("auth.welcome"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="border-b border-brand-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-heading text-xl font-semibold tracking-tight">Aurevia</Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-3xl font-medium tracking-tight mb-2">
            {mode === "signin" ? t("auth.signin.title") : t("auth.signup.title")}
          </h1>
          <p className="text-sm text-brand-muted mb-8">{t("auth.welcome")}</p>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field
                label={t("auth.name")}
                type="text"
                value={name}
                onChange={setName}
                autoComplete="name"
              />
            )}
            <Field label={t("auth.email")} type="email" value={email} onChange={setEmail} required autoComplete="email" />
            <Field label={t("auth.password")} type="password" value={password} onChange={setPassword} required minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-accent text-white py-3 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "…" : mode === "signin" ? t("auth.signin.cta") : t("auth.signup.cta")}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-xs text-brand-muted hover:text-brand-text transition-colors w-full text-center"
          >
            {mode === "signin" ? t("auth.toSignup") : t("auth.toSignin")}
          </button>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type, required, minLength, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type: string;
  required?: boolean; minLength?: number; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-brand-muted uppercase tracking-widest mb-2 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full bg-brand-bg ring-1 ring-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-brand-accent transition-shadow"
      />
    </label>
  );
}
