'use client';

/**
 * CTABanner — final CTA section.
 *
 * Background: linear-gradient(135deg, #0F1E12 0%, #162019 50%, #0F1E12 100%)
 * with top/bottom borders in rgba(196,146,58,0.15).
 *
 * Floating hexagons: 6 decorative CSS-animated hexagons at opacity 0.04,
 * color #C4923A. Built via clip-path polygon — no SVG path hand-authoring.
 * Respects prefers-reduced-motion (animation: none when reduced).
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/* Hexagon positions: [left%, top%, size(rem), animDuration(s), animDelay(s)] */
const HEXAGONS: [number, number, number, number, number][] = [
  [4,  10, 6.5, 18, 0],
  [14, 62, 4.0, 24, 3],
  [82, 8,  5.0, 21, 1.5],
  [90, 58, 7.0, 27, 0.8],
  [52, 80, 3.5, 19, 2.2],
  [38, 5,  4.5, 22, 4],
];

export function CTABanner() {
  return (
    <section
      className="relative overflow-hidden py-24 px-4"
      aria-labelledby="cta-heading"
      style={{
        background: 'linear-gradient(135deg, #0F1E12 0%, #162019 50%, #0F1E12 100%)',
        borderTop: '1px solid rgba(196,146,58,0.15)',
        borderBottom: '1px solid rgba(196,146,58,0.15)',
      }}
    >
      {/* Floating hexagon decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .hex-float { animation: hexFloat var(--dur, 20s) ease-in-out infinite; }
          }
          @keyframes hexFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33%       { transform: translateY(-18px) rotate(4deg); }
            66%       { transform: translateY(10px) rotate(-3deg); }
          }
        `}</style>

        {HEXAGONS.map(([l, t, size, dur, delay], idx) => (
          <div
            key={idx}
            className="hex-float absolute"
            style={{
              left: `${l}%`,
              top: `${t}%`,
              width: `${size}rem`,
              height: `${size * 1.1547}rem`, /* hex height = width × (2/√3) */
              background: '#C4923A',
              opacity: 0.04,
              clipPath:
                'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              ['--dur' as string]: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-[800px] mx-auto relative z-10 text-center">
        {/* Eyebrow */}
        <p
          className="text-[0.6875rem] font-bold uppercase tracking-[0.24em] mb-5"
          style={{ color: '#C4923A' }}
        >
          REJOIGNEZ LA COMMUNAUTÉ
        </p>

        {/* Headline */}
        <h2
          id="cta-heading"
          className="font-display font-bold italic leading-[1.12] tracking-[-0.025em] mb-5"
          style={{
            color: '#E4DBC8',
            fontSize: 'clamp(1.875rem, 4.5vw, 2.5rem)',
          }}
        >
          Prêt à transformer votre agriculture ?
        </h2>

        {/* Sub-headline */}
        <p
          className="text-base sm:text-lg leading-[1.7] mb-10 mx-auto"
          style={{ color: '#5E7A68', maxWidth: '50ch' }}
        >
          Rejoignez 50 000+ professionnels qui utilisent AgriIntel360 pour décider mieux chaque jour.
        </p>

        {/* Button row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-sm font-black uppercase tracking-[0.05em] transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
              color: '#07100A',
              boxShadow: '0 4px 20px rgba(196,146,58,0.28)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(196,146,58,0.38)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.filter = '';
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(196,146,58,0.28)';
            }}
          >
            Créer mon compte gratuitement
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all duration-200"
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
            Contacter l&apos;équipe
          </Link>
        </div>

        {/* Trust micro-copy */}
        <p
          className="mt-6 text-xs"
          style={{ color: 'rgba(94,122,104,0.7)' }}
        >
          Gratuit à vie · Pas de carte bancaire · Données sécurisées
        </p>
      </div>
    </section>
  );
}
