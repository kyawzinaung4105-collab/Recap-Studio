import { useState } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  value: 'my' | 'en';
  onChange: (lang: 'my' | 'en') => void;
}

const LANGUAGES = [
  { code: 'my' as const, label: 'မြန်မာ', subLabel: 'Burmese' },
  { code: 'en' as const, label: 'English', subLabel: 'English' },
];

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = LANGUAGES.find((l) => l.code === value)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 hover:border-amber-500/60 transition-all"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-amber-400" />
          <div className="text-left">
            <p className="text-sm font-medium">{selected.label}</p>
            <p className="text-xs text-slate-500">{selected.subLabel}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 w-full mt-2 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors ${
                  lang.code === value ? 'bg-amber-500/10' : ''
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-100">{lang.label}</p>
                  <p className="text-xs text-slate-500">{lang.subLabel}</p>
                </div>
                {lang.code === value && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
