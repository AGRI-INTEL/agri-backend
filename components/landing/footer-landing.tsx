'use client';

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
      { label: "Centre d'aide", href: '/contact' },
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
    <footer
      className="relative overflow-hidden"
      role="contentinfo"
      style={{ background: '#101E14', borderTop: '1px solid rgba(196,146,58,0.16)' }}
    >
      {/* Very subtle glow at top */}
      <div
        className="absolute top-0 left-1/4 w-96 h-72 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(196,146,58,0.06) 0%, transparent 70%)', transform: 'translateY(-50%)' }}
        aria-hidden
      />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-16 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.8fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group" aria-label="AgriIntel360 — Accueil">
              <div
                className="relative h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{ background: 'rgba(196,146,58,0.10)', border: '1px solid rgba(196,146,58,0.20)' }}
              >
                <Image src="/logo.png" alt="" fill className="object-contain p-1.5" sizes="48px" />
              </div>
              <div className="flex flex-col">
                <span className="text-[1.0625rem] font-black tracking-tight leading-none" style={{ color: '#E8E0CC' }}>
                  AgriIntel<span style={{ color: '#C4923A' }}>360</span>
                </span>
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.22em] mt-[3px]" style={{ color: '#4A6050' }}>
                  Intelligence agricole
                </span>
              </div>
            </Link>

            <p className="text-sm leading-[1.75] max-w-[28ch] mb-6" style={{ color: '#7D9486' }}>
              Plateforme de décision agricole pour l&apos;Afrique. Données en temps réel, IA prédictive et communauté pour les 4 filières.
            </p>

            {/* Contact info */}
            <div className="space-y-3 text-sm">
              <a
                href={`mailto:${APP_CONTACT_EMAIL}`}
                className="flex items-center gap-3 transition-colors duration-200 group/link"
                style={{ color: '#7D9486' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DDA85A'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#7D9486'; }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200"
                  style={{ background: 'rgba(232,224,204,0.04)', border: '1px solid rgba(232,224,204,0.07)' }}
                >
                  <Mail className="h-3.5 w-3.5" />
                </span>
                {APP_CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${APP_SUPPORT_PHONE.replace(/[^+0-9]/g, '')}`}
                className="flex items-center gap-3 transition-colors duration-200"
                style={{ color: '#7D9486' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DDA85A'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#7D9486'; }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(232,224,204,0.04)', border: '1px solid rgba(232,224,204,0.07)' }}
                >
                  <Phone className="h-3.5 w-3.5" />
                </span>
                {APP_SUPPORT_PHONE}
              </a>
              <div className="flex items-center gap-3" style={{ color: '#7D9486' }}>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(232,224,204,0.04)', border: '1px solid rgba(232,224,204,0.07)' }}
                >
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                Dakar, Sénégal
              </div>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h3
                className="text-[0.6875rem] font-bold uppercase tracking-[0.20em] mb-5"
                style={{ color: 'rgba(232,224,204,0.65)' }}
              >
                {col.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1 transition-colors duration-200 group/link"
                      style={{ color: '#7D9486' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DDA85A'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#7D9486'; }}
                    >
                      {link.label}
                      {link.href.startsWith('/') && (
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/link:opacity-60 transition-all duration-200 -translate-y-0.5 group-hover/link:translate-y-0" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" style={{ background: 'rgba(232,224,204,0.07)' }} />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between text-sm" style={{ color: '#4A6050' }}>
          <p>© {new Date().getFullYear()} AgriIntel360. Tous droits réservés.</p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Social links */}
            <div className="flex items-center gap-2">
              <span className="text-[0.625rem] font-bold uppercase tracking-wider mr-1" style={{ color: '#4A6050' }}>
                Suivez-nous
              </span>
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
                  style={{ background: 'rgba(232,224,204,0.04)', border: '1px solid rgba(232,224,204,0.07)', color: '#4A6050' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.25)'; (e.currentTarget as HTMLElement).style.color = '#C4923A'; (e.currentTarget as HTMLElement).style.background = 'rgba(196,146,58,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,224,204,0.07)'; (e.currentTarget as HTMLElement).style.color = '#4A6050'; (e.currentTarget as HTMLElement).style.background = 'rgba(232,224,204,0.04)'; }}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </Link>
              ))}
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#4A6050' }}>Langue :</span>
              <select
                className="rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 transition-colors"
                style={{
                  border: '1px solid rgba(232,224,204,0.09)',
                  background: 'rgba(232,224,204,0.04)',
                  color: '#7D9486',
                }}
                aria-label="Sélectionner la langue"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="wo">🇸🇳 Wolof</option>
              </select>
            </div>

            {/* Legal links */}
            <div className="flex items-center gap-4 text-xs">
              <Link href="/terms" className="transition-colors duration-200" style={{ color: '#4A6050' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7D9486'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#4A6050'; }}
              >
                Mentions légales
              </Link>
              <span style={{ color: '#2A3C2E' }}>·</span>
              <Link href="/privacy" className="transition-colors duration-200" style={{ color: '#4A6050' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7D9486'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#4A6050'; }}
              >
                Confidentialité
              </Link>
              <span style={{ color: '#2A3C2E' }}>·</span>
              <Link href="/contact" className="transition-colors duration-200" style={{ color: '#4A6050' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7D9486'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#4A6050'; }}
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
