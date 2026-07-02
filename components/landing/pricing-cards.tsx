'use client';

/**
 * PricingCards — 3 plans on dark ground, Pro card elevated with amber glow.
 * Matches the existing design system: ground #07100A, accent #C4923A.
 * The cream inversion (#F2EBD9) from the old version is removed — the brief
 * specifies the project palette and the dark ground reads more premium.
 */

import { useState } from 'react';
import { motion } from '@/lib/motion';
import { Check, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PricingPlanLocal {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
}

const PLANS: PricingPlanLocal[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 FCFA',
    period: '/mois',
    features: [
      'Accès limité aux données',
      '1 alerte active',
      'Communauté publique',
      'Carte interactive (lecture)',
      '5 requêtes AgriBot / jour',
    ],
    cta: "S'inscrire gratuitement",
    ctaHref: '/register',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '9 900 FCFA',
    period: '/mois',
    badge: 'Populaire',
    features: [
      'Données complètes toutes filières',
      'Alertes illimitées',
      'IA prédictive avancée',
      'Export CSV / Excel / PDF',
      'API limitée',
      'Support prioritaire',
      'Rapports personnalisés',
    ],
    cta: "Commencer l'essai gratuit",
    ctaHref: '/register',
    highlighted: true,
  },
  {
    id: 'institution',
    name: 'Institution',
    price: 'Sur devis',
    period: '',
    features: [
      'Tout Pro inclus',
      'Accès API illimité',
      'Multi-utilisateurs & SSO',
      'Reporting sur mesure',
      'Intégration SIG',
      'SLA 99,9 % · Support 24/7',
    ],
    cta: "Contacter l'équipe",
    ctaHref: '/contact',
    highlighted: false,
  },
];

export function PricingCards() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', organization: '', message: '' });
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSending(true);
    setContactError('');
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error('Erreur lors de l\'envoi');
      setContactSent(true);
    } catch {
      setContactError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setContactSending(false);
    }
  };

  return (
    <section
      className="py-24 px-4 scroll-mt-20 relative overflow-hidden"
      id="tarifs"
      aria-labelledby="pricing-heading"
      style={{
        background: '#07100A',
        borderTop: '1px solid rgba(196,146,58,0.10)',
      }}
    >
      {/* Ambient glow beneath the Pro card */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 56% 40% at 50% 60%, rgba(196,146,58,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            className="text-[0.6875rem] font-bold uppercase tracking-[0.24em] mb-3"
            style={{ color: '#C4923A' }}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            TARIFICATION
          </motion.p>
          <motion.h2
            id="pricing-heading"
            className="font-display text-[clamp(1.75rem,3.2vw,2.625rem)] font-bold italic tracking-[-0.02em] leading-[1.18]"
            style={{ color: '#E4DBC8' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Simple, transparent, sans surprise
          </motion.h2>
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 md:grid-cols-3 max-w-[980px] mx-auto items-start">
          {PLANS.map((plan, i) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: plan.highlighted ? 1.02 : 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: i * 0.08,
                duration: 0.55,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="relative flex flex-col overflow-hidden"
              style={
                plan.highlighted
                  ? {
                      background: '#162019',
                      border: '1px solid #C4923A',
                      borderRadius: '1.25rem',
                      boxShadow: '0 0 0 1px rgba(196,146,58,0.12), 0 8px 48px rgba(196,146,58,0.18)',
                    }
                  : {
                      background: '#111D14',
                      border: '1px solid rgba(196,146,58,0.13)',
                      borderRadius: '1.25rem',
                    }
              }
            >
              {/* Top accent line on Pro card */}
              {plan.highlighted && (
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, #C4923A 40%, #DDA85A 60%, transparent 100%)',
                  }}
                  aria-hidden="true"
                />
              )}

              <div className="flex flex-col flex-1 p-8">
                {/* Plan name + badge */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <h3
                    className="text-base font-black uppercase tracking-[0.08em]"
                    style={{ color: plan.highlighted ? '#C4923A' : '#5E7A68' }}
                  >
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[0.625rem] font-black uppercase tracking-[0.1em]"
                      style={{ background: '#C4923A', color: '#07100A' }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-7">
                  <span
                    className="font-display text-[2.25rem] font-bold tracking-[-0.03em]"
                    style={{ color: '#E4DBC8' }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="ml-1 text-sm font-medium"
                      style={{ color: '#5E7A68' }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div
                  className="mb-7"
                  style={{
                    height: '1px',
                    background: plan.highlighted
                      ? 'rgba(196,146,58,0.18)'
                      : 'rgba(196,146,58,0.08)',
                  }}
                />

                {/* Features */}
                <ul className="flex-1 flex flex-col gap-3 mb-8" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span
                        className="mt-[2px] shrink-0 flex h-[17px] w-[17px] items-center justify-center rounded-full"
                        style={{
                          background: plan.highlighted
                            ? 'rgba(196,146,58,0.14)'
                            : 'rgba(30,107,62,0.16)',
                        }}
                        aria-hidden="true"
                      >
                        <Check
                          className="h-[9px] w-[9px]"
                          style={{
                            color: plan.highlighted ? '#C4923A' : '#1E6B3E',
                            strokeWidth: 2.5,
                          }}
                        />
                      </span>
                      <span style={{ color: '#5E7A68' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.highlighted ? (
                  <Link
                    href={plan.ctaHref}
                    className="block w-full rounded-xl py-3.5 text-center text-sm font-black uppercase tracking-[0.06em] transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
                      color: '#07100A',
                      boxShadow: '0 4px 20px rgba(196,146,58,0.28)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.filter = '';
                      (e.currentTarget as HTMLElement).style.transform = '';
                    }}
                  >
                    {plan.cta}
                  </Link>
                ) : plan.id === 'free' ? (
                  <Link
                    href={plan.ctaHref}
                    className="block w-full rounded-xl py-3.5 text-center text-sm font-bold transition-all duration-200"
                    style={{
                      border: '1px solid rgba(196,146,58,0.28)',
                      color: '#C4923A',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(196,146,58,0.07)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.28)';
                    }}
                  >
                    {plan.cta}
                  </Link>
                ) : plan.id === 'institution' ? (
                  <button
                    onClick={() => setContactOpen(true)}
                    className="block w-full rounded-xl py-3.5 text-center text-sm font-medium transition-all duration-200"
                    style={{
                      color: '#5E7A68',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#E4DBC8';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#5E7A68';
                    }}
                  >
                    {plan.cta} →
                  </button>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className="block w-full rounded-xl py-3.5 text-center text-sm font-medium transition-all duration-200"
                    style={{
                      color: '#5E7A68',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#E4DBC8';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#5E7A68';
                    }}
                  >
                    {plan.cta} →
                  </Link>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* ── Contact Modal ── */}
      <Dialog open={contactOpen} onOpenChange={(open) => { if (!open) { setContactOpen(false); setContactSent(false); setContactError(''); } }}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            background: '#111D14',
            border: '1px solid rgba(196,146,58,0.2)',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: '#E4DBC8' }}>Contacter l'équipe</DialogTitle>
            <DialogDescription style={{ color: '#5E7A68' }}>
              Plan Institution — notre équipe vous répond sous 24h.
            </DialogDescription>
          </DialogHeader>

          {contactSent ? (
            <div className="text-center py-8 space-y-3">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(196,146,58,0.14)' }}
              >
                <Send className="h-6 w-6" style={{ color: '#C4923A' }} />
              </div>
              <p className="text-lg font-semibold" style={{ color: '#E4DBC8' }}>Message envoyé</p>
              <p className="text-sm" style={{ color: '#5E7A68' }}>
                Merci ! Nous vous recontacterons rapidement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#E4DBC8' }}>Nom complet</label>
                <Input
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Votre nom"
                  className="border-border/40"
                  style={{ background: '#0C1810', color: '#E4DBC8' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#E4DBC8' }}>Email</label>
                <Input
                  required
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="vous@exemple.com"
                  className="border-border/40"
                  style={{ background: '#0C1810', color: '#E4DBC8' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#E4DBC8' }}>Organisation</label>
                <Input
                  value={contactForm.organization}
                  onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                  placeholder="Nom de votre organisation"
                  className="border-border/40"
                  style={{ background: '#0C1810', color: '#E4DBC8' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#E4DBC8' }}>Message</label>
                <Textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Décrivez vos besoins..."
                  className="border-border/40 resize-none"
                  style={{ background: '#0C1810', color: '#E4DBC8' }}
                />
              </div>

              {contactError && (
                <p className="text-sm" style={{ color: '#F87171' }}>{contactError}</p>
              )}

              <Button
                type="submit"
                disabled={contactSending}
                className="w-full rounded-xl py-2.5 text-sm font-black uppercase tracking-[0.06em] transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
                  color: '#07100A',
                }}
              >
                {contactSending ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi...
                  </span>
                ) : (
                  'Envoyer la demande'
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
