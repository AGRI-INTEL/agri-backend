'use client';

import { cn } from '@/lib/utils';

type Locale = 'fr' | 'en';

interface AuthLanguageToggleProps {
  className?: string;
  value?: Locale;
  onChange?: (locale: Locale) => void;
  compact?: boolean;
}

export function AuthLanguageToggle({
  className,
  value = 'fr',
  onChange,
}: AuthLanguageToggleProps) {
  const setLocale = (locale: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agriintel-locale', locale);
      document.documentElement.lang = locale;
    }
    onChange?.(locale);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/15 p-1 text-[11px] font-bold uppercase backdrop-blur-md shadow-sm',
        className
      )}
      role="group"
      aria-label="Langue"
    >
      <button
        type="button"
        onClick={() => setLocale('fr')}
        className={cn(
          'flex h-7 px-3.5 items-center justify-center rounded-full transition-all duration-200 cursor-pointer',
          value === 'fr'
            ? 'bg-white text-emerald-950 shadow-sm'
            : 'text-white/80 hover:text-white hover:bg-white/5'
        )}
        aria-pressed={value === 'fr'}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={cn(
          'flex h-7 px-3.5 items-center justify-center rounded-full transition-all duration-200 cursor-pointer',
          value === 'en'
            ? 'bg-white text-emerald-950 shadow-sm'
            : 'text-white/80 hover:text-white hover:bg-white/5'
        )}
        aria-pressed={value === 'en'}
      >
        EN
      </button>
    </div>
  );
}
