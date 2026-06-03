import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
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
      { label: `Email: ${APP_CONTACT_EMAIL}`, href: `mailto:${APP_CONTACT_EMAIL}` },
      { label: `Téléphone: ${APP_SUPPORT_PHONE}`, href: `tel:${APP_SUPPORT_PHONE.replace(/[^+0-9]/g, '')}` },
      { label: 'Centre d’aide', href: '/contact' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', href: '#fonctionnalites' },
      { label: 'Notre mission', href: '#fonctionnalites' },
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
    <footer className="bg-card border-t border-border" role="contentinfo">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-4 mb-6">
              <div className="relative h-14 w-14">
                <Image
                  src="/logo.png"
                  alt="AgriIntel360 Logo"
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">AgriIntel<span className="text-emerald-500">360</span></span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-1">Intelligence agricole</span>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-slate-600">
              Une plateforme moderne pour piloter l’agriculture africaine avec des données en temps réel.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
              <a href={
                `mailto:${APP_CONTACT_EMAIL}`
              } className="rounded-full bg-slate-100 px-3 py-2 transition hover:bg-slate-200">
                {APP_CONTACT_EMAIL}
              </a>
              <a href={
                `tel:${APP_SUPPORT_PHONE.replace(/[^+0-9]/g, '')}`
              } className="rounded-full bg-slate-100 px-3 py-2 transition hover:bg-slate-200">
                {APP_SUPPORT_PHONE}
              </a>
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900 mb-4">{col.title}</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
                      <a href={link.href} className="transition hover:text-emerald-600">{link.label}</a>
                    ) : (
                      <Link href={link.href} className="transition hover:text-emerald-600">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
          <p>© 2026 AgriIntel360. Tous droits réservés.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-slate-500">
              <span className="font-semibold text-slate-700">Suivez-nous :</span>
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label={link.label}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <span>Langue :</span>
              <select
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                aria-label="Sélectionner la langue"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="wo">🇸🇳 Wolof</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
