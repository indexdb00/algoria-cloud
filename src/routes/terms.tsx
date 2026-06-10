import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Algoria" },
      { name: "description", content: "Algoria terms of use and data policy." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useI18n();

  const sections = [1, 2, 3, 4, 5].map((i) => ({
    title: t(`terms.s${i}.title`),
    body: t(`terms.s${i}.body`),
  }));

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <header className="border-b border-brand-border">
        <div className="mx-auto max-w-3xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="font-heading text-base font-medium tracking-tight">Algoria</span>
          </Link>
          <LanguageSwitcher compact />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 md:px-8 py-12">
        <div className="text-[10px] uppercase tracking-widest neon-text mb-2">{t("terms.kicker")}</div>
        <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight mb-8">{t("terms.title")}</h1>
        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-heading text-lg font-medium mb-2">{s.title}</h2>
              <p className="text-sm text-brand-muted leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 text-xs text-brand-muted">{t("terms.updated")}</div>
      </main>
    </div>
  );
}
