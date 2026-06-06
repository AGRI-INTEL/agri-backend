'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, animate } from '@/lib/motion';

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-100px' });
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const mv = useMotionValue(0);
  const sv = useSpring(mv, { duration: 2500 });

  useEffect(() => {
    if (inView && !isNaN(numericValue)) {
      animate(mv, numericValue, { duration: 2.5 });
    }
  }, [inView, mv, numericValue]);

  useEffect(() => {
    return sv.on('change', (latest) => {
      if (ref.current) {
        const postfix = value.match(/[^0-9]*$/)?.[0] || '';
        ref.current.textContent = `${Math.round(latest).toLocaleString('fr-FR')}${postfix}`;
      }
    });
  }, [sv, value]);

  return (
    <motion.div
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.06] hover:border-emerald-400/15"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <p className="text-4xl font-black text-white sm:text-5xl">
        <span ref={ref}>{value}</span>
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">{label}</p>
    </motion.div>
  );
}

const STATS_DATA = [
  { value: '82%', label: 'Réduction du risque' },
  { value: '34%', label: 'Amélioration de rendement' },
  { value: '12+', label: 'Couverture multi-pays' },
];

export function AnimatedStatsBar() {
  return (
    <section className="relative overflow-hidden py-20 px-4 bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-emerald-950/20 to-slate-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2" />

      <div className="max-w-content mx-auto relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-400/80 mb-4 font-semibold">Confiance & performance</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white">
            Des données fiables pour des{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              décisions rapides
            </span>
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-slate-400 text-base sm:text-lg leading-8">
            AgriIntel360 offre des alertes climatiques, des prévisions de rendement et des analyses de marché pour aider vos équipes à agir au bon moment.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-3">
          {STATS_DATA.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
