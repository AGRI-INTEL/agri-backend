'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from '@/lib/motion';

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
type Locale = 'fr' | 'en';

interface AuthShellProps {
  children: React.ReactNode;
}

/* ─────────────────────────────────────────────────────────────
   Hexgrid canvas — parcelles agricoles animées
───────────────────────────────────────────────────────────── */
interface HexCell {
  cx: number;
  cy: number;
  r: number;
  baseAlpha: number;
  pulseType: 'none' | 'green' | 'gold';
  phase: number;
  speed: number;
}

function buildHexGrid(width: number, height: number): HexCell[] {
  const cells: HexCell[] = [];
  const BASE_R = 38;
  const dx = BASE_R * Math.sqrt(3);
  const dy = BASE_R * 1.5;
  const cols = Math.ceil(width / dx) + 2;
  const rows = Math.ceil(height / dy) + 2;

  // Seeded pseudo-random so the grid is stable between renders
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : dx / 2;
      const cx = col * dx + offsetX;
      const cy = row * dy;
      const r = 28 + rand() * 12; // 28–40px
      const baseAlpha = 0.06 + rand() * 0.10; // subtle fill
      const pulseRoll = rand();
      let pulseType: HexCell['pulseType'] = 'none';
      if (pulseRoll < 0.08) pulseType = 'gold';
      else if (pulseRoll < 0.22) pulseType = 'green';
      cells.push({
        cx,
        cy,
        r,
        baseAlpha,
        pulseType,
        phase: rand() * Math.PI * 2,
        speed: 0.4 + rand() * 0.8, // radians/s
      });
    }
  }
  return cells;
}

function hexPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function HexCanvas({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const cellsRef = useRef<HexCell[]>([]);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const { offsetWidth, offsetHeight } = canvas.parentElement!;
      canvas.width = offsetWidth * devicePixelRatio;
      canvas.height = offsetHeight * devicePixelRatio;
      canvas.style.width = offsetWidth + 'px';
      canvas.style.height = offsetHeight + 'px';
      ctx.scale(devicePixelRatio, devicePixelRatio);
      cellsRef.current = buildHexGrid(offsetWidth, offsetHeight);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const draw = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000; // seconds
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      // Background fill
      ctx.fillStyle = '#07100A';
      ctx.fillRect(0, 0, w, h);

      for (const cell of cellsRef.current) {
        const { cx, cy, r, baseAlpha, pulseType, phase, speed } = cell;

        // Base hex fill
        hexPath(ctx, cx, cy, r - 1.5);
        ctx.fillStyle = `rgba(22,32,25,${baseAlpha})`;
        ctx.fill();

        // Hex border
        hexPath(ctx, cx, cy, r - 1);
        ctx.strokeStyle = 'rgba(196,146,58,0.09)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Pulse overlay
        if (pulseType !== 'none' && !reduced) {
          const t = Math.sin(phase + elapsed * speed);
          const pulse = (t + 1) / 2; // 0→1
          if (pulseType === 'green') {
            hexPath(ctx, cx, cy, r - 1.5);
            ctx.fillStyle = `rgba(30,107,62,${pulse * 0.30})`;
            ctx.fill();
          } else {
            hexPath(ctx, cx, cy, r - 1.5);
            ctx.fillStyle = `rgba(196,146,58,${pulse * 0.22})`;
            ctx.fill();
            // Ring
            hexPath(ctx, cx, cy, r - 0.5);
            ctx.strokeStyle = `rgba(196,146,58,${pulse * 0.35})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Top-bottom gradient vignette so content overlays read well
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(7,16,10,0.72)');
      grad.addColorStop(0.35, 'rgba(7,16,10,0.0)');
      grad.addColorStop(0.65, 'rgba(7,16,10,0.0)');
      grad.addColorStop(1, 'rgba(7,16,10,0.82)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Right-edge fade so it bleeds into the right panel
      const rightGrad = ctx.createLinearGradient(w - 80, 0, w, 0);
      rightGrad.addColorStop(0, 'rgba(7,16,10,0)');
      rightGrad.addColorStop(1, 'rgba(7,16,10,0.95)');
      ctx.fillStyle = rightGrad;
      ctx.fillRect(0, 0, w, h);

      rafRef.current = requestAnimationFrame(draw);
    };

    if (!reduced) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      // Static render for prefers-reduced-motion
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      ctx.fillStyle = '#07100A';
      ctx.fillRect(0, 0, w, h);
      for (const cell of cellsRef.current) {
        hexPath(ctx, cell.cx, cell.cy, cell.r - 1.5);
        ctx.fillStyle = `rgba(22,32,25,${cell.baseAlpha})`;
        ctx.fill();
        hexPath(ctx, cell.cx, cell.cy, cell.r - 1);
        ctx.strokeStyle = 'rgba(196,146,58,0.09)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   Language toggle
───────────────────────────────────────────────────────────── */
function LangToggle({ value, onChange }: { value: Locale; onChange: (l: Locale) => void }) {
  const set = (l: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agriintel-locale', l);
      document.documentElement.lang = l;
    }
    onChange(l);
  };
  return (
    <div
      role="group"
      aria-label="Langue"
      className="inline-flex items-center gap-0.5 rounded-full p-1"
      style={{ border: '1px solid rgba(196,146,58,0.28)', background: 'rgba(196,146,58,0.08)' }}
    >
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          aria-pressed={value === l}
          className="h-7 w-10 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          style={
            value === l
              ? { background: '#C4923A', color: '#1A1000' }
              : { color: 'rgba(196,146,58,0.60)' }
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Trust badges
───────────────────────────────────────────────────────────── */
const TRUST_ITEMS = [
  { icon: '🔒', label: 'Connexion chiffrée SSL' },
  { icon: '✓', label: '50 000+ producteurs actifs' },
  { icon: '🌍', label: '12 pays d\'Afrique couverts' },
];

/* ─────────────────────────────────────────────────────────────
   AuthShell — composant principal
───────────────────────────────────────────────────────────── */
export function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname();
  const wide = pathname === '/register';
  const [locale, setLocale] = useState<Locale>('fr');
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Persist locale
    const stored = localStorage.getItem('agriintel-locale');
    if (stored === 'en' || stored === 'fr') {
      setLocale(stored);
      document.documentElement.lang = stored;
    }
    // Detect reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ background: '#07100A' }}
    >
      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — hexgrid canvas + brand overlay
      ════════════════════════════════════════════════════════ */}
      <div
        className="relative hidden lg:flex lg:w-[45%] shrink-0 flex-col overflow-hidden"
        style={{ background: '#07100A' }}
      >
        {/* Animated hexgrid canvas */}
        <HexCanvas reduced={reduced} />

        {/* Radial gold glow — art direction */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(196,146,58,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Brand content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full h-full min-h-screen">

          {/* Logo — top left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label="AgriIntel360 — Accueil"
            >
              <div
                className="relative h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: 'rgba(196,146,58,0.12)',
                  border: '1px solid rgba(196,146,58,0.30)',
                }}
              >
                <Image src="/logo.png" alt="" fill className="object-contain p-1.5" sizes="44px" />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-[1.0625rem] font-black tracking-tight leading-none"
                  style={{ color: '#E4DBC8' }}
                >
                  AgriIntel<span style={{ color: '#C4923A' }}>360</span>
                </span>
                <span
                  className="text-[0.625rem] font-bold uppercase tracking-[0.22em] mt-[3px]"
                  style={{ color: '#5E7A68' }}
                >
                  Intelligence agricole
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Central quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-[360px]"
          >
            <div
              className="w-10 h-[2px] mb-6"
              style={{ background: 'linear-gradient(90deg, #C4923A, rgba(196,146,58,0.20))' }}
              aria-hidden
            />
            <blockquote
              className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold italic leading-[1.2] mb-5"
              style={{ color: '#E4DBC8' }}
            >
              &ldquo;Décidez mieux,{' '}
              <em className="not-italic" style={{ color: '#C4923A' }}>
                cultivez plus intelligemment.
              </em>
              &rdquo;
            </blockquote>
            <p className="text-sm leading-[1.72]" style={{ color: '#5E7A68' }}>
              La plateforme de référence pour l&apos;intelligence agricole en Afrique — données en
              temps réel, IA prédictive et recommandations concrètes.
            </p>
          </motion.div>

          {/* Trust badges — bottom */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col gap-2.5"
          >
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm shrink-0"
                  style={{
                    background: 'rgba(196,146,58,0.10)',
                    border: '1px solid rgba(196,146,58,0.18)',
                  }}
                >
                  {item.icon}
                </div>
                <span className="text-xs font-medium" style={{ color: 'rgba(228,219,200,0.50)' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — form area
      ════════════════════════════════════════════════════════ */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center min-h-screen overflow-y-auto lg:w-[55%]"
        style={{ background: '#07100A' }}
      >
        {/* Subtle radial glow at center */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(196,146,58,0.08) 0%, transparent 68%)',
          }}
        />

        {/* Language toggle — top right */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-5 right-5 z-20"
        >
          <LangToggle value={locale} onChange={setLocale} />
        </motion.div>

        {/* Mobile: landscape image band instead of left panel */}
        <div className="relative w-full h-40 shrink-0 overflow-hidden lg:hidden">
          <Image
            src="/fond-landscape.webp"
            alt=""
            aria-hidden
            fill
            className="object-cover"
            style={{ objectPosition: 'center 35%', opacity: 0.44 }}
            sizes="100vw"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(7,16,10,0.68) 0%, rgba(7,16,10,0.96) 100%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-4 z-10"
          >
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="relative h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(196,146,58,0.14)',
                  border: '1px solid rgba(196,146,58,0.28)',
                }}
              >
                <Image src="/logo.png" alt="" fill className="object-contain p-1" sizes="32px" />
              </div>
              <span className="font-black text-base tracking-tight" style={{ color: '#E4DBC8' }}>
                AgriIntel<span style={{ color: '#C4923A' }}>360</span>
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Card wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 w-full flex flex-1 items-center justify-center px-4 py-10"
        >
          <div
            className={`w-full rounded-[20px] ${
              wide
                ? 'max-w-[460px] max-h-[calc(100dvh-4rem)] overflow-y-auto px-8 py-8 sm:px-10'
                : 'max-w-[420px] px-8 py-10 sm:px-10'
            }`}
            style={{
              background: 'rgba(22,32,25,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(196,146,58,0.15)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
            }}
          >
            {/* Logo centré en haut de la card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <Image
                src="/logo.png"
                alt="AgriIntel360"
                width={220}
                height={120}
                className="h-auto w-full object-contain"
                style={{ maxWidth: '140px' }}
                priority
              />
            </motion.div>

            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
