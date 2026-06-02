import { useEffect, useRef, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LANGUAGES, useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-dark inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="size-3.5 text-neon" />
        {compact ? current.label : current.name}
        <ChevronDown className={"size-3 transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-44 z-50 rounded-lg bg-brand-surface ring-1 ring-brand-border shadow-2xl shadow-black/60 py-1"
        >
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={
                    "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors " +
                    (active ? "text-neon" : "text-brand-text hover:text-neon hover:bg-brand-bg/60")
                  }
                  role="option"
                  aria-selected={active}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-brand-muted w-6">{l.label}</span>
                    {l.name}
                  </span>
                  {active && <Check className="size-3.5" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
