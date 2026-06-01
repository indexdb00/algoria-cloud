import { LANGUAGES, useI18n } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex gap-2 text-[11px] font-medium tracking-wider uppercase text-brand-muted">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={
            lang === l.code
              ? "text-brand-text underline underline-offset-4"
              : "cursor-pointer hover:text-brand-text transition-colors"
          }
          aria-label={l.name}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
