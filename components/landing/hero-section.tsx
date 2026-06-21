'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useMotionValue, useSpring, animate } from '@/lib/motion';
import { ArrowRight, Play } from 'lucide-react';

/* ─────────────────────────────────────────────
   AnimatedCounter
───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });

  useEffect(() => {
    if (inView) {
      animate(motionValue, target, { duration: 2 });
    }
  }, [inView, motionValue, target]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(latest).toLocaleString('fr-FR')}${suffix}`;
      }
    });
  }, [springValue, suffix]);

  return (
    <span ref={ref}>
      {target.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
   WavyUnderline SVG
───────────────────────────────────────────── */
function WavyUnderline() {
  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        bottom: '-4px',
        left: 0,
        width: '100%',
        overflow: 'visible',
      }}
      height="8"
      preserveAspectRatio="none"
    >
      <path
        d="M0,4 Q25%,0 50%,4 T100%,4"
        stroke="#C4923A"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="200"
        strokeDashoffset="200"
        style={{ animation: 'drawLine 1.2s 0.8s ease forwards' }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Stats data
───────────────────────────────────────────── */
const STAT_DISPLAY = [
  { display: '50k+', label: 'producteurs', target: 50, suffix: 'k+' },
  { display: '2,5M', label: 'hectares', target: 2, suffix: ',5M' },
  { display: '12', label: 'pays', target: 12, suffix: '' },
  { display: '98%', label: 'précision IA', target: 98, suffix: '%' },
];

/* ─────────────────────────────────────────────
   Headline words split for stagger animation
───────────────────────────────────────────── */
const HEADLINE_WORDS = [
  { text: "L'intelligence", highlight: false },
  { text: 'agricole', highlight: false },
  { text: 'au', highlight: true, underline: false },
  { text: 'service', highlight: true, underline: true },
  { text: "de", highlight: false },
  { text: "l'Afrique", highlight: false },
];

/* ─────────────────────────────────────────────
   HeroSection
───────────────────────────────────────────── */
export function HeroSection() {
  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden"
      aria-label="Section héros"
      style={{
        minHeight: '100vh',
        background: '#07100A',
      }}
    >
      {/* ── keyframes injected inline ── */}
      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ── Background image ── */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Image
          src="/fond-landscape.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ opacity: 0.45, objectPosition: 'center 35%' }}
        />
      </div>

      {/* ── Directional overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(180deg, #07100A 0%, transparent 45%, rgba(20,12,3,0.80) 65%, #07100A 100%)',
        }}
        aria-hidden
      />

      {/* ── Gold radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(196,146,58,0.18) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* ── Content ── */}
      <div
        className="relative mx-auto w-full px-6 lg:px-8 py-28 flex flex-col items-center text-center"
        style={{ zIndex: 10, maxWidth: '720px' }}
      >
        {/* Badge */}
        <div
          style={{
            animation: 'fadeDown 0.55s 0s ease both',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '9999px',
            padding: '8px 20px',
            background: 'rgba(196,146,58,0.10)',
            border: '1px solid rgba(196,146,58,0.28)',
            color: '#DDA85A',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            marginBottom: '2.25rem',
          }}
        >
          <span
            aria-hidden
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#C4923A',
              flexShrink: 0,
              display: 'inline-block',
            }}
          />
          🌾 Plateforme agricole n°1 en Afrique de l&apos;Ouest
        </div>

        {/* Headline */}
        <h1
          className="font-display font-bold italic"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#E4DBC8',
            marginBottom: '1.5rem',
            maxWidth: '720px',
          }}
        >
          {HEADLINE_WORDS.map((word, i) => {
            const isUnderlined = word.underline;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{
                  display: 'inline-block',
                  marginRight: i < HEADLINE_WORDS.length - 1 ? '0.28em' : 0,
                  color: word.highlight ? '#C4923A' : '#E4DBC8',
                  position: isUnderlined ? 'relative' : undefined,
                }}
              >
                {word.text}
                {isUnderlined && <WavyUnderline />}
              </motion.span>
            );
          })}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: '1.125rem',
            lineHeight: 1.75,
            color: '#5E7A68',
            maxWidth: '560px',
            marginBottom: '2.5rem',
          }}
        >
          Données en temps réel, IA prédictive, alertes et communauté — tout ce dont les
          professionnels agricoles ont besoin pour décider mieux.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '3rem',
          }}
        >
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
              color: '#07100A',
              fontWeight: 700,
              fontSize: '0.9375rem',
              padding: '13px 28px',
              borderRadius: '9999px',
              boxShadow: '0 4px 20px rgba(196,146,58,0.28)',
              transition: 'filter 0.2s ease, transform 0.2s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            Commencer gratuitement
            <ArrowRight
              size={16}
              style={{ transition: 'transform 0.2s ease' }}
              className="group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="#demo"
            className="inline-flex items-center justify-center gap-2"
            style={{
              background: 'transparent',
              color: '#E4DBC8',
              fontWeight: 600,
              fontSize: '0.9375rem',
              padding: '13px 28px',
              borderRadius: '9999px',
              border: '1px solid rgba(196,146,58,0.40)',
              transition: 'border-color 0.2s ease, background 0.2s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#C4923A';
              (e.currentTarget as HTMLElement).style.background = 'rgba(196,146,58,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.40)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <Play size={14} style={{ color: '#C4923A' }} />
            Voir la démo
          </Link>
        </motion.div>

        {/* Stats inline row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            rowGap: '10px',
          }}
          role="list"
          aria-label="Chiffres clés"
        >
          {STAT_DISPLAY.map((stat, i) => (
            <span
              key={stat.label}
              role="listitem"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: i < STAT_DISPLAY.length - 1 ? '0' : '0',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#E4DBC8',
                  }}
                >
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#5E7A68',
                    letterSpacing: '0.02em',
                  }}
                >
                  {stat.label}
                </span>
              </span>

              {/* Gold dot separator */}
              {i < STAT_DISPLAY.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#C4923A',
                    margin: '0 14px',
                    flexShrink: 0,
                  }}
                />
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
