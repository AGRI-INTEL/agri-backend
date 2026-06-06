'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronUp, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from '@/lib/motion';

const NAV_LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#secteurs', label: 'Secteurs' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#temoignages', label: 'Témoignages' },
  { href: '/contact', label: 'Contact' },
];

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/25 backdrop-blur-sm transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-110 active:scale-95"
          aria-label="Retour en haut"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function NavbarLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.filter(l => l.href.startsWith('#')).map(l => l.href.slice(1));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      }
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-white/80 text-slate-900 backdrop-blur-2xl shadow-lg shadow-slate-900/5 border-b border-slate-200/50'
            : 'bg-transparent text-white'
        )}
        role="banner"
      >
        {/* Top gradient line */}
        <div className={cn(
          'absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 transition-opacity duration-500',
          scrolled && 'opacity-100'
        )} />

        <div className="max-w-content mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-4 shrink-0 group">
            <div className="relative h-11 w-11 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2">
              <Image
                src="/logo.png"
                alt="AgriIntel360 Logo"
                fill
                className="object-contain"
                sizes="44px"
                priority
              />
            </div>
            <div className="hidden xs:block">
              <p className={cn('text-lg font-black tracking-tight leading-none transition-colors duration-300', scrolled ? 'text-slate-900' : 'text-white')}>
                AgriIntel<span className="text-emerald-500">360</span>
              </p>
              <p className={cn('text-[11px] uppercase tracking-[0.25em] font-bold mt-1 transition-colors duration-300', scrolled ? 'text-slate-400' : 'text-white/60')}>
                Intelligence agricole
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => {
              const isActive = link.href.startsWith('#') && activeSection === link.href.slice(1);
              const isExternal = link.href.startsWith('/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    scrolled
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-white/80 hover:text-white',
                    isActive && !isExternal && (scrolled ? 'text-emerald-600 bg-emerald-50' : 'text-emerald-300 bg-white/10')
                  )}
                >
                  {link.label}
                  {isExternal && <ArrowUpRight className="inline h-3 w-3 ml-0.5 -mt-0.5" />}
                  {isActive && !isExternal && (
                    <span className={cn(
                      'absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full',
                      scrolled ? 'bg-emerald-500' : 'bg-emerald-400'
                    )} />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
                scrolled
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              S&apos;inscrire
            </Link>
          </div>

          <button
            className={cn(
              'md:hidden rounded-2xl p-2 transition-all duration-200',
              scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="mx-4 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/10 overflow-hidden">
              <div className="space-y-1 px-4 pb-4 pt-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-emerald-600"
                    onClick={closeMobile}
                  >
                    {link.label}
                    {link.href.startsWith('/') && <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />}
                  </Link>
                ))}
                <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <Link
                    href="/login"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={closeMobile}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:shadow-emerald-500/20"
                    onClick={closeMobile}
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BackToTop />
    </>
  );
}
