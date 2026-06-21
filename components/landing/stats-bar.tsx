'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, animate } from '@/lib/motion';

function AnimatedStat({ value, label, desc }: { value: string; label: string; desc: string }) {
  const ref = useRef<HTMLSpanElement>(null);
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
        const prefix = value.match(/^[^0-9+]*/)?.[0] || '';
        const postfix = value.match(/[^0-9]*$/)?.[0] || '';
        ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString('fr-FR')}${postfix}`;
      }
    });
  }, [sv, value]);

  return (
    <motion.div
      className="text-center px-10"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
    >
      <p className="font-display text-[3.25rem] font-bold tracking-[-0.04em] leading-none mb-3" style={{ color: '#E8E0CC' }}>
        <span ref={ref}>{value}</span>
        <span style={{ color: '#C4923A' }}>{label}</span>
      </p>
      <p className="text-sm max-w-[22ch] mx-auto leading-[1.6]" style={{ color: '#7D9486' }}>{desc}</p>
    </motion.div>
  );
}

const STATS_DATA = [
  { value: '82', label: '%', desc: 'de réduction du risque climato-agricole grâce aux alertes préventives' },
  { value: '+34', label: '%', desc: "d'amélioration de rendement moyen chez les utilisateurs actifs" },
  { value: '12', label: '+', desc: "pays d'Afrique subsaharienne couverts par notre réseau de données" },
];

export function AnimatedStatsBar() {
  return (
    <section
      className="relative overflow-hidden py-20 px-4"
      style={{ background: '#101E14', borderTop: '1px solid rgba(196,146,58,0.16)', borderBottom: '1px solid rgba(196,146,58,0.16)' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: '#C4923A' }}>
            Résultats mesurés sur le terrain
          </p>
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.625rem)] font-bold tracking-[-0.025em]" style={{ color: '#E8E0CC' }}>
            Des données qui améliorent<br />chaque saison agricole.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3">
          {STATS_DATA.map((stat, i) => (
            <div
              key={stat.value}
              style={{
                borderRight: i < STATS_DATA.length - 1 ? '1px solid rgba(196,146,58,0.14)' : 'none',
              }}
            >
              <AnimatedStat {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
