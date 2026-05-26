'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Locale = 'fr' | 'en';

interface AuthShellProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

function LangToggle({ value, onChange }: { value: Locale; onChange: (l: Locale) => void }) {
  const set = (l: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agriintel-locale', l);
      document.documentElement.lang = l;
    }
    onChange(l);
  };
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-white/25 bg-white/10 p-1 backdrop-blur-sm"
      role="group"
      aria-label="Langue"
    >
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          aria-pressed={value === l}
          className={cn(
            'h-7 w-10 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer',
            value === l
              ? 'bg-white text-green-800 shadow-sm'
              : 'text-white/75 hover:text-white'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function AuthShell({ children, showLogo = true }: AuthShellProps) {
  const pathname = usePathname();
  const wide = pathname === '/register';
  const [locale, setLocale] = useState<Locale>('fr');

  useEffect(() => {
    const stored = localStorage.getItem('agriintel-locale');
    if (stored === 'en' || stored === 'fr') {
      setLocale(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Gauche : photo plein écran ── */}
      <div className="relative hidden lg:flex lg:w-[55%] shrink-0 overflow-hidden">
        {/* Background image */}
        <Image
          src="/fond-landscape.jpg"
          alt=""
          aria-hidden="true"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-800/40 to-amber-800/50" />
        {/* Texture grain */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'}} />

        {/* Brand overlay content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Top logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-white text-lg">🌿</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight drop-shadow">AgriIntel360</span>
          </div>

          {/* Quote block */}
          <div className="max-w-md">
            <blockquote className="text-white/90 text-2xl font-semibold leading-snug mb-4 drop-shadow-lg">
              &quot;Décidez mieux, cultivez plus intelligemment.&quot;
            </blockquote>
            <p className="text-white/65 text-sm leading-relaxed">
              La plateforme de référence pour l&apos;intelligence agricole en Afrique de l&apos;Ouest — données en temps réel, IA prédictive et communauté.
            </p>

            {/* Stats row */}
            <div className="mt-8 flex gap-8">
              {[
                { value: '50K+', label: 'Agriculteurs' },
                { value: '12', label: 'Pays' },
                { value: '98%', label: 'Satisfaction' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-white font-black text-2xl">{s.value}</p>
                  <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Droite : formulaire ── */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center min-h-screen overflow-y-auto"
        style={{ background: 'linear-gradient(150deg,#064e3b 0%,#065f46 30%,#047857 60%,#b45309 100%)' }}
      >
        {/* Lang toggle top-right */}
        <div className="absolute top-5 right-5 z-20">
          <LangToggle value={locale} onChange={setLocale} />
        </div>

        {/* Mobile background image strip */}
        <div className="relative w-full h-44 shrink-0 overflow-hidden lg:hidden">
          <Image
            src="/fond-landscape.jpg"
            alt=""
            aria-hidden
            fill
            className="object-cover"
            style={{ objectPosition: 'center 35%' }}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/80" />
        </div>

        {/* Card */}
        <div className="relative z-10 w-full flex flex-1 items-center justify-center px-4 py-10">
          <div
            className={cn(
              'w-full bg-white rounded-3xl shadow-2xl',
              wide
                ? 'max-w-[440px] max-h-[calc(100dvh-4rem)] overflow-y-auto px-8 py-8 sm:px-10'
                : 'max-w-[420px] px-8 py-10 sm:px-10'
            )}
          >
            {showLogo && (
              <div className="flex justify-center mb-6">
                <Image
                  src="/logo.png"
                  alt="Agri Intel"
                  width={220}
                  height={120}
                  className="h-auto w-full max-w-[180px] object-contain"
                  priority
                />
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
