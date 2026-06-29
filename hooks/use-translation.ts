'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getTranslations, type Language, type Translations } from '@/lib/i18n';

const STORAGE_KEY = 'agriintel-locale';

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored === 'en' || stored === 'pt') return stored;
  return 'fr';
}

export function useTranslation(): { t: Translations; lang: Language; setLang: (lang: Language) => void } {
  const [lang, setLangState] = useState<Language>('fr');

  useEffect(() => {
    setLangState(getStoredLanguage());
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const newLang = e.newValue as Language;
        if (newLang === 'en' || newLang === 'pt' || newLang === 'fr') setLangState(newLang);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    document.documentElement.lang = newLang;
    document.cookie = `AGRI_LANG=${newLang}; path=/; max-age=${365 * 86400}; SameSite=Lax`;
    setLangState(newLang);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: newLang }));
  }, []);

  const t = useMemo(() => getTranslations(lang), [lang]);
  return { t, lang, setLang };
}
