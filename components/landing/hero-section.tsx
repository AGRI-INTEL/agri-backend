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
      className="absolute -bottom-1 left-0 w-full overflow-visible text-secondary"
      height="8"
      preserveAspectRatio="none"
    >
      <path
        d="M0,4 Q25%,0 50%,4 T100%,4"
        stroke="currentColor"
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
      className="relative flex flex-col justify-center overflow-hidden min-h-screen bg-background"
      aria-label="Section héros"
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
        className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-b from-background via-transparent via-45% to-[rgba(20,12,3,0.80)] to-65% to-background"
        aria-hidden
      />

      {/* ── Gold radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[2] bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(196,146,58,0.18)_0%,transparent_70%)]"
        aria-hidden
      />

      {/* ── Content ── */}
      <div
        className="relative mx-auto w-full px-6 lg:px-8 py-28 flex flex-col items-center text-center"
        style={{ zIndex: 10, maxWidth: '720px' }}
      >
        {/* Badge */}
        <div
          className="animate-[fadeDown_0.55s_0s_ease_both] inline-flex items-center gap-2 rounded-full px-5 py-2 bg-secondary/10 border border-secondary/30 text-[#DDA85A] text-[0.8125rem] font-semibold tracking-[0.01em] mb-9"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0 inline-block"
          />
          🌾 Plateforme agricole n°1 en Afrique de l&apos;Ouest
        </div>

        {/* Headline */}
        <h1
          className="font-display font-bold italic text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] tracking-[-0.02em] text-foreground mb-6 max-w-[720px]"
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
                className={`inline-block ${i < HEADLINE_WORDS.length - 1 ? 'mr-[0.28em]' : ''} ${word.highlight ? 'text-secondary' : 'text-foreground'} ${isUnderlined ? 'relative' : ''}`}
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
          className="text-lg leading-[1.75] text-muted-foreground max-w-[560px] mb-10"
        >
          Données en temps réel, IA prédictive, alertes et communauté — tout ce dont les
          professionnels agricoles ont besoin pour décider mieux.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-row gap-3 flex-wrap justify-center mb-12"
        >
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 bg-gradient-to-br from-secondary to-[#b07928] text-background font-bold text-[0.9375rem] px-7 py-[13px] rounded-full shadow-[0_4px_20px_rgba(196,146,58,0.28)] transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 no-underline"
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
            className="inline-flex items-center justify-center gap-2 bg-transparent text-foreground font-semibold text-[0.9375rem] px-7 py-[13px] rounded-full border border-secondary/40 transition-all duration-200 hover:border-secondary hover:bg-secondary/10 no-underline"
          >
            <Play size={14} className="text-secondary" />
            Voir la démo
          </Link>
        </motion.div>

        {/* Stats inline row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-wrap items-center justify-center gap-0 gap-y-2.5"
          role="list"
          aria-label="Chiffres clés"
        >
          {STAT_DISPLAY.map((stat, i) => (
            <span
              key={stat.label}
              role="listitem"
              className="inline-flex items-center"
            >
              <span className="inline-flex items-baseline gap-1">
                <span
                  className="font-mono font-bold text-base text-foreground"
                >
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </span>
                <span
                  className="text-xs text-muted-foreground tracking-[0.02em]"
                >
                  {stat.label}
                </span>
              </span>

              {/* Gold dot separator */}
              {i < STAT_DISPLAY.length - 1 && (
                <span
                  aria-hidden
                  className="inline-block w-1 h-1 rounded-full bg-secondary mx-3.5 shrink-0"
                />
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
