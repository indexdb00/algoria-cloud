import { LANGUAGES, useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t, lang, setLang } = useI18n();
  return (
    <footer className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-[30ch]">
            <span className="font-heading text-lg font-semibold tracking-tight block mb-4">Algoria</span>
            <p className="text-xs text-brand-muted leading-relaxed">{t("footer.tagline")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-brand-muted mb-6 block">{t("footer.platform")}</span>
              <ul className="space-y-4">
                <li><a href="#agents" className="text-xs hover:text-brand-muted transition-colors">{t("agents.title")}</a></li>
                <li><a href="#pricing" className="text-xs hover:text-brand-muted transition-colors">{t("pricing.title")}</a></li>
              </ul>
            </div>
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-brand-muted mb-6 block">{t("footer.agency")}</span>
              <ul className="space-y-4">
                <li><a href="#case" className="text-xs hover:text-brand-muted transition-colors">{t("nav.cases")}</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-[10px] font-medium uppercase tracking-widest text-brand-muted mb-6 block">{t("footer.regional")}</span>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={lang === l.code ? "text-brand-text font-medium" : "text-brand-muted hover:text-brand-text transition-colors"}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between gap-4">
          <span className="text-[10px] text-brand-muted">{t("footer.rights")}</span>
          <div className="flex gap-6">
            <span className="text-[10px] text-brand-muted hover:text-brand-text cursor-pointer transition-colors">{t("footer.privacy")}</span>
            <span className="text-[10px] text-brand-muted hover:text-brand-text cursor-pointer transition-colors">{t("footer.terms")}</span>
            <span className="text-[10px] text-brand-muted hover:text-brand-text cursor-pointer transition-colors">{t("footer.legal")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
