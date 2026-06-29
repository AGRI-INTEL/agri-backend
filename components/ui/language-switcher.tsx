'use client';

import { useState, useEffect, useCallback } from 'react';
import { Languages, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type Lang = 'fr' | 'en';

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const STORAGE_KEY = 'agriintel-locale';

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'fr';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'fr') return stored;
  const navLang = navigator.language?.startsWith('en') ? 'en' : 'fr';
  return navLang;
}

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'minimal' | 'full' | 'dropdown';
  onLangChange?: (lang: Lang) => void;
}

export function LanguageSwitcher({ className, variant = 'dropdown', onLangChange }: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState<Lang>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentLang(getInitialLang());
    setMounted(true);
  }, []);

  const applyLang = useCallback((lang: Lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.cookie = `AGRI_LANG=${lang}; path=/; max-age=${365 * 86400}; SameSite=Lax`;
    setCurrentLang(lang);
    onLangChange?.(lang);
  }, [onLangChange]);

  if (!mounted) return <div className="h-8 w-8" />;

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => applyLang(l.code)}
            className={cn(
              'h-7 px-2 text-xs font-bold uppercase rounded-md transition-all',
              currentLang === l.code
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
            aria-label={l.label}
          >
            {l.code}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/30', className)}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => applyLang(l.code)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all',
              currentLang === l.code
                ? 'bg-card text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="text-base">{l.flag}</span>
            <span>{l.label}</span>
            {currentLang === l.code && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('h-9 w-9 rounded-lg', className)}>
          <Languages className="h-[18px] w-[18px]" />
          <span className="sr-only">Changer de langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl min-w-[140px]">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => applyLang(l.code)}
            className={cn(
              'flex items-center gap-2.5 text-sm font-medium rounded-lg',
              currentLang === l.code && 'bg-primary/5 text-primary font-semibold',
            )}
          >
            <span className="text-base">{l.flag}</span>
            <span className="flex-1">{l.label}</span>
            {currentLang === l.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
