'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence, useInView } from '@/lib/motion';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Sector data (brief-exact) ────────────────────────────────────────────────

interface SectorIndicator {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

interface SectorData {
  id: 'vegetal' | 'animal' | 'halieutique' | 'forestier';
  label: string;
  accent: string;
  accentDim: string;          // rgba version for backgrounds
  subtitle: string;
  description: string;
  indicators: SectorIndicator[];
  chartValues: number[];      // 12 data points for the mini canvas chart
  href: string;
}

const SECTORS: SectorData[] = [
  {
    id: 'vegetal',
    label: 'Végétal',
    accent: '#16a34a',
    accentDim: 'rgba(22,163,74,0.14)',
    subtitle: 'Cultures céréalières, maraîchage, arboriculture',
    description:
      'Suivi GPS des parcelles, alertes ravageurs et prédictions de rendement par IA pour 324 cultures — du mil au cacao en passant par l\'anacarde.',
    indicators: [
      { label: 'Hectares suivis', value: '1,8M ha', trend: 'up' },
      { label: 'Cultures référencées', value: '324', trend: 'up' },
      { label: 'Prix marché', value: 'J−1', trend: 'neutral' },
    ],
    chartValues: [42, 55, 48, 62, 58, 71, 68, 76, 72, 85, 80, 91],
    href: '/production',
  },
  {
    id: 'animal',
    label: 'Animal',
    accent: '#D97706',
    accentDim: 'rgba(217,119,6,0.14)',
    subtitle: 'Élevage bovin, ovin, avicole',
    description:
      'Traçabilité individuelle de chaque tête, suivi sanitaire temps réel et circuits d\'approvisionnement — avec alertes épizooties dès les premières détections.',
    indicators: [
      { label: 'Têtes suivies', value: '890 000', trend: 'up' },
      { label: 'Circuits', value: '42', trend: 'up' },
      { label: 'Alertes épizooties', value: 'Actif', trend: 'neutral' },
    ],
    chartValues: [60, 58, 63, 57, 65, 70, 68, 73, 75, 71, 78, 82],
    href: '/elevage',
  },
  {
    id: 'halieutique',
    label: 'Halieutique',
    accent: '#1d4ed8',
    accentDim: 'rgba(29,78,216,0.14)',
    subtitle: 'Pêche continentale et maritime',
    description:
      'Cartographie des zones de pêche, quotas en temps réel et météo marine — pour 120 ports de débarquement et 87 espèces suivies.',
    indicators: [
      { label: 'Ports couverts', value: '120', trend: 'up' },
      { label: 'Espèces suivies', value: '87', trend: 'neutral' },
      { label: 'Quotas', value: 'Temps réel', trend: 'up' },
    ],
    chartValues: [50, 45, 52, 48, 55, 61, 58, 64, 62, 69, 66, 73],
    href: '/halieutique',
  },
  {
    id: 'forestier',
    label: 'Forestier',
    accent: '#059669',
    accentDim: 'rgba(5,150,105,0.14)',
    subtitle: 'Gestion durable des forêts',
    description:
      'Suivi satellitaire du couvert forestier, intégration REDD+ et marché carbone — pour 4,2 millions d\'hectares de forêts certifiées.',
    indicators: [
      { label: 'Hectares gérés', value: '4,2M ha', trend: 'up' },
      { label: 'Standard', value: 'REDD+ intégré', trend: 'neutral' },
      { label: 'Crédits carbone', value: 'En direct', trend: 'up' },
    ],
    chartValues: [30, 35, 33, 40, 38, 44, 42, 50, 48, 56, 54, 62],
    href: '/forestier',
  },
];

// ─── Animated canvas mini-chart ───────────────────────────────────────────────

interface MiniChartProps {
  values: number[];
  accent: string;
  active: boolean;
}

function MiniChart({ values, accent, active }: MiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pad = { top: 8, right: 8, bottom: 20, left: 8 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const step = chartW / (values.length - 1);

    const xOf = (i: number) => pad.left + i * step;
    const yOf = (v: number) => pad.top + chartH - ((v - min) / range) * chartH;

    // Hex to rgb helper
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };
    const { r, g, b } = hexToRgb(accent.length === 7 ? accent : '#16a34a');

    let startTs: number | null = null;
    const DURATION = active ? 800 : 0;

    const draw = (ts: number) => {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      const t = active ? Math.min(elapsed / DURATION, 1) : 1;
      // ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      progressRef.current = ease;

      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(228,219,200,0.06)';
      ctx.lineWidth = 1;
      for (let row = 0; row <= 3; row++) {
        const y = pad.top + (chartH / 3) * row;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();
      }

      // Visible point count based on animation progress
      const visibleCount = Math.max(2, Math.ceil(ease * values.length));
      const visibleValues = values.slice(0, visibleCount);

      // Gradient fill
      const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.28)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0.00)`);

      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(visibleValues[0]));
      visibleValues.forEach((v, i) => {
        if (i === 0) return;
        const x0 = xOf(i - 1);
        const y0 = yOf(visibleValues[i - 1]);
        const x1 = xOf(i);
        const y1 = yOf(v);
        const cx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cx, y0, cx, y1, x1, y1);
      });
      ctx.lineTo(xOf(visibleValues.length - 1), H - pad.bottom);
      ctx.lineTo(xOf(0), H - pad.bottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(visibleValues[0]));
      visibleValues.forEach((v, i) => {
        if (i === 0) return;
        const x0 = xOf(i - 1);
        const y0 = yOf(visibleValues[i - 1]);
        const x1 = xOf(i);
        const y1 = yOf(v);
        const cx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cx, y0, cx, y1, x1, y1);
      });
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Last point dot
      const lastX = xOf(visibleValues.length - 1);
      const lastY = yOf(visibleValues[visibleValues.length - 1]);
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.22)`;
      ctx.fill();

      // X-axis month labels
      const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
      ctx.fillStyle = 'rgba(228,219,200,0.30)';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'center';
      values.forEach((_, i) => {
        ctx.fillText(months[i] || '', xOf(i), H - 4);
      });

      if (t < 1) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    startTs = null;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [values, accent, active]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-hidden="true"
      style={{ display: 'block' }}
    />
  );
}

// ─── Trend icon ───────────────────────────────────────────────────────────────

function TrendIcon({ trend, accent }: { trend: 'up' | 'down' | 'neutral'; accent: string }) {
  if (trend === 'up') return <TrendingUp className="h-3 w-3" style={{ color: accent }} aria-hidden />;
  if (trend === 'down') return <TrendingDown className="h-3 w-3" style={{ color: '#f87171' }} aria-hidden />;
  return <Minus className="h-3 w-3" style={{ color: '#5E7A68' }} aria-hidden />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SectorShowcase() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef as React.RefObject<Element>, { once: true, margin: '-80px' });
  const sector = SECTORS[active];

  const handleTabChange = useCallback((index: number) => {
    setActive(index);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="secteurs"
      aria-labelledby="sector-showcase-heading"
      className="relative overflow-hidden"
      style={{
        background: '#07100A',
        paddingTop: 'clamp(4rem, 8vw, 7rem)',
        paddingBottom: 'clamp(4rem, 8vw, 7rem)',
      }}
    >
      {/* Subtle texture — radial glow from top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 0%, rgba(196,146,58,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <motion.div
          className="mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p
            className="mb-4 text-[0.6875rem] font-bold uppercase tracking-[0.22em]"
            style={{ color: '#C4923A' }}
          >
            Secteurs agricoles
          </p>
          <h2
            id="sector-showcase-heading"
            className="font-display text-[clamp(1.875rem,3.5vw,2.75rem)] font-bold italic leading-[1.12] tracking-[-0.025em]"
            style={{ color: '#E4DBC8' }}
          >
            Une plateforme couvrant<br />
            toute la chaîne agricole
          </h2>
        </motion.div>

        {/* ── Tab bar ────────────────────────────────────────────────────────── */}
        <motion.div
          role="tablist"
          aria-label="Filières agricoles"
          className="mb-8 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {SECTORS.map((s, i) => {
            const isActive = active === i;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`sector-panel-${s.id}`}
                id={`sector-tab-${s.id}`}
                onClick={() => handleTabChange(i)}
                className={cn(
                  'relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-250 focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-[#07100A]'
                )}
                style={{
                  background: isActive ? s.accentDim : 'rgba(255,255,255,0.04)',
                  border: isActive
                    ? `1px solid ${s.accent}44`
                    : '1px solid rgba(196,146,58,0.10)',
                  color: isActive ? s.accent : '#5E7A68',
                }}
              >
                {s.label}
                {/* Active underline */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                    style={{ background: s.accent }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ── Panel ──────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sector.id}
            id={`sector-panel-${sector.id}`}
            role="tabpanel"
            aria-labelledby={`sector-tab-${sector.id}`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start"
          >
            {/* ── Left: content ──────────────────────────────────────────────── */}
            <div
              className="flex flex-col gap-7 rounded-2xl p-7 sm:p-9"
              style={{
                background: '#111D14',
                border: '1px solid rgba(196,146,58,0.10)',
              }}
            >
              {/* Sector label + subtitle */}
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="h-1 w-8 rounded-full"
                    style={{ background: sector.accent }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-[0.6875rem] font-bold uppercase tracking-[0.20em]"
                    style={{ color: sector.accent }}
                  >
                    Filière {sector.label}
                  </span>
                </div>
                <h3
                  className="mb-3 font-display text-[1.5rem] font-bold italic leading-[1.2] tracking-tight"
                  style={{ color: '#E4DBC8' }}
                >
                  {sector.subtitle}
                </h3>
                <p
                  className="text-sm leading-[1.75]"
                  style={{ color: '#5E7A68' }}
                >
                  {sector.description}
                </p>
              </div>

              {/* Indicators */}
              <div className="grid grid-cols-3 gap-3" role="list" aria-label="Indicateurs clés">
                {sector.indicators.map((ind) => (
                  <div
                    key={ind.label}
                    role="listitem"
                    className="flex flex-col gap-1.5 rounded-xl p-3.5"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(196,146,58,0.08)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[0.625rem] font-bold uppercase tracking-[0.18em] leading-tight"
                        style={{ color: '#5E7A68' }}
                      >
                        {ind.label}
                      </span>
                      <TrendIcon trend={ind.trend} accent={sector.accent} />
                    </div>
                    <span
                      className="font-mono text-base font-bold leading-none"
                      style={{ color: '#E4DBC8' }}
                    >
                      {ind.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div>
                <Link
                  href={sector.href}
                  className="group inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${sector.accent} 0%, ${sector.accent}CC 100%)`,
                    color: '#07100A',
                    boxShadow: `0 4px 20px ${sector.accent}33`,
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
                  En savoir plus
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            {/* ── Right: data card ───────────────────────────────────────────── */}
            <div
              className="flex flex-col gap-4 rounded-2xl p-6 sm:p-8"
              style={{
                background: '#111D14',
                border: '1px solid rgba(196,146,58,0.10)',
                minHeight: '320px',
              }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-[0.625rem] font-bold uppercase tracking-[0.20em] mb-1"
                    style={{ color: '#5E7A68' }}
                  >
                    Activité annuelle — {sector.label}
                  </p>
                  <p
                    className="font-mono text-2xl font-bold"
                    style={{ color: '#E4DBC8' }}
                  >
                    {sector.indicators[0].value}
                  </p>
                  <p
                    className="text-[0.6875rem] mt-0.5"
                    style={{ color: sector.accent }}
                  >
                    {sector.indicators[0].label}
                  </p>
                </div>
                <div
                  className="rounded-lg px-2.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em]"
                  style={{
                    background: sector.accentDim,
                    color: sector.accent,
                    border: `1px solid ${sector.accent}33`,
                  }}
                >
                  En direct
                </div>
              </div>

              {/* Canvas chart */}
              <div
                className="relative flex-1 overflow-hidden rounded-xl"
                style={{
                  background: 'rgba(7,16,10,0.6)',
                  border: '1px solid rgba(196,146,58,0.07)',
                  minHeight: '160px',
                }}
              >
                <MiniChart
                  values={sector.chartValues}
                  accent={sector.accent}
                  active={true}
                />
              </div>

              {/* Bottom row: secondary indicators */}
              <div className="grid grid-cols-2 gap-3">
                {sector.indicators.slice(1).map((ind) => (
                  <div
                    key={ind.label}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(196,146,58,0.07)',
                    }}
                  >
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: sector.accent }}
                      aria-hidden="true"
                    />
                    <div>
                      <p
                        className="text-[0.625rem] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: '#5E7A68' }}
                      >
                        {ind.label}
                      </p>
                      <p
                        className="font-mono text-sm font-bold"
                        style={{ color: '#E4DBC8' }}
                      >
                        {ind.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
