'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useMotionValue, useSpring, animate } from '@/lib/motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });

  useEffect(() => {
    if (inView && !isNaN(numericValue)) {
      animate(motionValue, numericValue, { duration: 2 });
    }
  }, [inView, motionValue, numericValue]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        const prefix = value.match(/^[^0-9]*/)?.[0] || '';
        const postfix = value.match(/[^0-9]*$/)?.[0] || '';
        ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString('fr-FR')}${postfix}`;
      }
    });
  }, [springValue, value]);

  return <span ref={ref}>{value}</span>;
}

const STATS = [
  { value: '50,000+', label: 'Agriculteurs actifs' },
  { value: '2.5M', label: 'Hectares suivis' },
  { value: '12', label: 'Pays couverts' },
  { value: '98%', label: 'Précision IA' },
];

export function HeroSection() {
  return (
    <section
      className="landing-hero relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 pt-24"
      aria-label="Section héros"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/fond-landscape.jpg"
          alt="Paysage agricole avec informations en surimpression"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-emerald-950/70 to-slate-900/90" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.18),_transparent_35%)] opacity-80" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-emerald-100 backdrop-blur-md shadow-sm shadow-emerald-950/20">
            <div className="relative h-6 w-6">
              <Image
                src="/logo.png"
                alt=""
                fill
                className="object-contain"
                sizes="24px"
              />
            </div>
            Plateforme d’intelligence agricole tout-en-un
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15 }}>
          <h1 className="mt-8 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
            Gérez vos cultures, vos données et vos alertes en un seul endroit.
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25 }}>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-200 sm:text-lg leading-8">
            AgriIntel360 combine l’IA, les prévisions météo, le suivi de parcelles et les analyses de marché pour renforcer l’agriculture africaine.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button variant="glow" size="xl" asChild>
              <Link href="/register">
                Créer un compte gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild className="border-white/30 text-white hover:text-white hover:bg-white/10">
              <Link href="#fonctionnalites">Voir les fonctionnalités</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.55 }}>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-left shadow-lg shadow-slate-950/10 backdrop-blur-md">
                <p className="text-3xl font-black text-white">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
