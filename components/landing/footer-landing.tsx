import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { APP_CONTACT_EMAIL, APP_SUPPORT_PHONE } from '@/lib/constants';
import Image from 'next/image';

const FOOTER_COLS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '#fonctionnalites' },
      { label: 'Secteurs', href: '#secteurs' },
      { label: 'Tarifs', href: '#tarifs' },
      { label: 'Témoignages', href: '#temoignages' },
      { label: 'Connexion', href: '/login' },
      { label: "S'inscrire", href: '/register' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Centre d’aide', href: '/contact' },
      { label: 'Documentation', href: '/contact' },
      { label: 'Statut du service', href: '/contact' },
      { label: 'Signaler un bug', href: '/contact' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', href: '#fonctionnalites' },
      { label: 'Notre mission', href: '#fonctionnalites' },
      { label: 'Blog', href: '/contact' },
      { label: 'Carrières', href: '/contact' },
      { label: 'Contactez-nous', href: '/contact' },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'Twitter/X', href: '#', icon: Twitter },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'YouTube', href: '#', icon: Youtube },
];

export function FooterLanding() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300 border-t border-slate-800/50" role="contentinfo">
      {/* Background gradient */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

      <div className="max-w-content mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.8fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link href="/" className="inline-flex items-center gap-4 mb-6 group">
              <div className="relative h-12 w-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2">
                <Image
                  src="/logo.png"
                  alt="AgriIntel360 Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white leading-none">AgriIntel<span className="text-emerald-400">360</span></span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-1">Intelligence agricole</span>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-slate-400">
              Une plateforme moderne pour piloter l&apos;agriculture africaine avec des données en temps réel, des alertes intelligentes et une communauté engagée.
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-3 text-sm">
              <a href={`mailto:${APP_CONTACT_EMAIL}`} className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors group">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50 group-hover:bg-emerald-500/20 transition-colors">
                  <Mail className="h-4 w-4" />
                </span>
                {APP_CONTACT_EMAIL}
              </a>
              <a href={`tel:${APP_SUPPORT_PHONE.replace(/[^+0-9]/g, '')}`} className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors group">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50 group-hover:bg-emerald-500/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </span>
                {APP_SUPPORT_PHONE}
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50">
                  <MapPin className="h-4 w-4" />
                </span>
                Dakar, Sénégal
              </div>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/80 mb-5">{col.title}</h3>
              <ul className="space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
                      <a href={link.href} className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-emerald-400">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-emerald-400 group/link">
                        {link.label}
                        {link.href.startsWith('/') && link.href !== '#fonctionnalites' && link.href !== '#secteurs' && link.href !== '#tarifs' && link.href !== '#temoignages' ? (
                          <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 group-hover/link:opacity-100 group-hover/link:translate-y-0 transition-all duration-200" />
                        ) : null}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-slate-800" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} AgriIntel360. Tous droits réservés.</p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Social links */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Suivez-nous :</span>
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 transition-all duration-200 hover:bg-emerald-500/20 hover:text-emerald-400 hover:scale-110"
                    aria-label={link.label}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </Link>
                );
              })}
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Langue :</span>
              <select
                className="rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                aria-label="Sélectionner la langue"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="wo">🇸🇳 Wolof</option>
              </select>
            </div>

            {/* Legal links */}
            <div className="flex items-center gap-3 text-xs">
              <Link href="/contact" className="text-slate-500 hover:text-slate-300 transition-colors">Mentions légales</Link>
              <span className="text-slate-700">·</span>
              <Link href="/contact" className="text-slate-500 hover:text-slate-300 transition-colors">Confidentialité</Link>
              <span className="text-slate-700">·</span>
              <Link href="/contact" className="text-slate-500 hover:text-slate-300 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
