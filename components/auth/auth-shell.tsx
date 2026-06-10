'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from '@/lib/motion';

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

function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={cn('absolute rounded-full opacity-20', className)}
      animate={{
        y: [0, -20, 0, 15, 0],
        x: [0, 10, -10, 5, 0],
        scale: [1, 1.05, 0.95, 1.02, 1],
      }}
      transition={{
        repeat: Infinity,
        duration: 8 + delay,
        ease: 'easeInOut',
        delay,
      }}
    />
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
      {/* ── Gauche : hero visuel ── */}
      <div className="relative hidden lg:flex lg:w-[45%] shrink-0 overflow-hidden">
        <Image
          src="/fond-landscape.jpg"
          alt=""
          aria-hidden="true"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/85 via-emerald-700/85 to-emerald-900/85" />
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'}} />

        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight drop-shadow">AgriIntel360</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-md"
          >
            <blockquote className="text-white/90 text-2xl sm:text-3xl font-semibold leading-snug mb-4 drop-shadow-lg">
              &quot;Décidez mieux, cultivez plus intelligemment.&quot;
            </blockquote>
            <p className="text-white/65 text-sm leading-relaxed">
              La plateforme de référence pour l&apos;intelligence agricole en Afrique de l&apos;Ouest — données en temps réel, IA prédictive et communauté.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Droite : formulaire ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center min-h-screen overflow-y-auto lg:w-[55%] bg-[#f3f4f6]">
        {/* Animated background shapes */}
        <FloatingShape className="w-64 h-64 bg-emerald-200/20 top-10 -left-20 blur-3xl" delay={1} />
        <FloatingShape className="w-80 h-80 bg-amber-200/20 bottom-20 -right-20 blur-3xl" delay={3} />

        {/* Lang toggle top-right */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-5 right-5 z-20"
        >
          <LangToggle value={locale} onChange={setLocale} />
        </motion.div>

        {/* Mobile header strip */}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-4 z-10"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="text-white font-bold text-base drop-shadow">AgriIntel360</span>
            </div>
          </motion.div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 w-full flex flex-1 items-center justify-center px-4 py-10"
        >
          <div
            className={cn(
              'w-full bg-white rounded-[16px] shadow-xl shadow-black/8',
              wide
                ? 'max-w-[440px] max-h-[calc(100dvh-4rem)] overflow-y-auto px-8 py-8 sm:px-10'
                : 'max-w-[420px] px-8 py-10 sm:px-10'
            )}
          >
            {showLogo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                <Image
                  src="/logo.png"
                  alt="Agri Intel"
                  width={220}
                  height={120}
                  className="h-auto w-full max-w-[180px] object-contain"
                  priority
                />
              </motion.div>
            )}
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
