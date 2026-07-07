'use client';

/**
 * TestimonialCarousel — rewritten as static 3-card grid.
 *
 * Aesthetic risk: each card has a left "soil stripe" — a 3px vertical band
 * in the card author's sector colour, like a tabbed page in a field journal.
 * This replaces the default oversized decorative quotation mark pattern.
 */

import { motion } from '@/lib/motion';
import { SECTOR_CONFIG } from '@/lib/constants';

// Country flag emojis keyed by country_code
const FLAG: Record<string, string> = {
  SN: '🇸🇳',
  BF: '🇧🇫',
  GH: '🇬🇭',
  CI: '🇨🇮',
  CM: '🇨🇲',
  TG: '🇹🇬',
};

const FEATURED_TESTIMONIALS = [
  {
    id: 'kofi',
    name: 'Kofi Mensah',
    role: 'Producteur',
    country: 'Ghana',
    country_code: 'GH',
    rating: 5 as const,
    quote:
      "AgriIntel360 a transformé notre façon de gérer nos 200 hectares de maïs. Les alertes météo nous ont évité deux mauvaises récoltes cette année.",
    sector: 'vegetal' as const,
  },
  {
    id: 'aminata',
    name: 'Aminata Diallo',
    role: 'Coopérative',
    country: 'Sénégal',
    country_code: 'SN',
    rating: 5 as const,
    quote:
      "Les données sur les prix des marchés régionaux nous permettent de négocier bien mieux avec les acheteurs. Un outil indispensable.",
    sector: 'vegetal' as const,
  },
  {
    id: 'yao',
    name: 'Dr. Yao Akakpo',
    role: 'Chercheur IRAD',
    country: 'Togo',
    country_code: 'TG',
    rating: 5 as const,
    quote:
      "En tant que chercheur, j'apprécie la qualité des données géospatiales et la précision des modèles prédictifs pour notre région.",
    sector: 'vegetal' as const,
  },
];

/* Sector stripe colours — warmer/earthier variants of the sector palette */
const STRIPE_COLOR: Record<string, string> = {
  vegetal: '#1E6B3E',
  animal: '#b07928',
  halieutique: '#0a7fa3',
  forestier: '#7a4e1e',
  minier: '#6B7280',
  industriel: '#4F46E5',
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div
      className="flex gap-1"
      role="img"
      aria-label={`${rating} étoiles sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={i < rating ? 'fill-secondary' : 'fill-secondary/15'}
        >
          <path d="M10 1l2.66 5.38 5.94.86-4.3 4.19 1.01 5.91L10 14.74l-5.31 2.6 1.01-5.91L1.4 7.24l5.94-.86z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialCarousel() {
  return (
    <section
      className="py-24 px-4 scroll-mt-20 relative overflow-hidden bg-background border-t border-b border-border/20"
      id="temoignages"
      data-community-section
      aria-labelledby="testimonials-heading"
    >
      {/* Subtle ambient bloom */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(30,107,62,0.07)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Section header */}
        <div className="mb-14">
          <motion.p
            className="text-[0.6875rem] font-bold uppercase tracking-[0.24em] mb-3 text-secondary"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            ILS NOUS FONT CONFIANCE
          </motion.p>
          <motion.h2
            id="testimonials-heading"
            className="font-display text-[clamp(1.75rem,3.2vw,2.625rem)] font-bold italic tracking-[-0.02em] leading-[1.18] text-foreground"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Ce que disent nos utilisateurs
          </motion.h2>
        </div>

        {/* 3-card grid */}
        <ul
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          style={{ listStyle: 'none', padding: 0, margin: 0 }}
        >
          {FEATURED_TESTIMONIALS.map((t, i) => {
            const stripeColor = STRIPE_COLOR[t.sector] ?? '#1E6B3E';
            const sectorEmoji = SECTOR_CONFIG[t.sector]?.emoji ?? '';
            const flag = FLAG[t.country_code] ?? '';

            return (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.55,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <article
                  className="relative h-full flex overflow-hidden bg-card/70 backdrop-blur-sm border border-border/20 rounded-[1.25rem]"
                >
                  {/* Soil stripe — the aesthetic risk: a left border in sector colour */}
                  <div
                    className="shrink-0 w-[3px] self-stretch rounded-l-[inherit]"
                    style={{ background: stripeColor, opacity: 0.82 }}
                    aria-hidden="true"
                  />

                  <div className="flex flex-col p-7 gap-5 flex-1">
                    {/* Stars */}
                    <StarRow rating={t.rating} />

                    {/* Quote */}
                    <blockquote className="flex-1 font-display text-[1.0625rem] font-bold italic leading-[1.58] text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>

                    {/* Author row */}
                    <footer className="flex items-center gap-3 pt-1 border-t border-border/10">
                      {/* Monogram avatar */}
                      <div
                        className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black select-none text-foreground"
                        style={{
                          background: `linear-gradient(135deg, ${stripeColor} 0%, #0a120c 100%)`,
                          boxShadow: `0 2px 12px ${stripeColor}44`,
                        }}
                        aria-hidden="true"
                      >
                        {t.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs mt-0.5 truncate text-muted-foreground">
                          {t.role}
                          <span className="mx-1.5 text-muted-foreground/30" aria-hidden="true">·</span>
                          {flag} {t.country}
                        </p>
                      </div>

                      {/* Sector badge */}
                      <div
                        className="shrink-0 flex items-center justify-center rounded-md h-8 w-8 text-base bg-secondary/10 border border-secondary/20"
                        aria-label={`Filière ${t.sector}`}
                      >
                        {sectorEmoji}
                      </div>
                    </footer>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
