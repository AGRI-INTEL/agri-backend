'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#secteurs', label: 'Secteurs' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#temoignages', label: 'Témoignages' },
  { href: '/contact', label: 'Contact' },
];

export function NavbarLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b border-transparent',
        scrolled
          ? 'bg-white/95 text-slate-900 backdrop-blur-xl shadow-sm border-slate-200'
          : 'bg-slate-950/70 text-white backdrop-blur-xl shadow-none'
      )}
      role="banner"
    >
      <div className="max-w-content mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-4 shrink-0">
          <div className="relative h-12 w-12 transition-transform hover:scale-110 duration-300">
            <Image
              src="/logo.png"
              alt="AgriIntel360 Logo"
              fill
              className="object-contain"
              sizes="48px"
              priority
            />
          </div>
          <div className="hidden xs:block">
            <p className={cn('text-lg font-black tracking-tight leading-none', scrolled ? 'text-slate-900' : 'text-white')}>
              AgriIntel<span className="text-emerald-500">360</span>
            </p>
            <p className={cn('text-[11px] uppercase tracking-[0.25em] font-bold mt-1.5', scrolled ? 'text-slate-500' : 'text-white/80')}>
              Intelligence agricole
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all duration-150',
                scrolled
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150',
              scrolled
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-white/90 hover:text-white hover:bg-white/15'
            )}
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]"
          >
            S&apos;inscrire
          </Link>
        </div>

        <button
          className={cn(
            'md:hidden rounded-2xl p-2 transition-all duration-150',
            scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 shadow-2xl shadow-slate-900/10">
          <div className="space-y-1 px-4 pb-4 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                onClick={() => setMobileOpen(false)}
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
