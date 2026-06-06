'use client';

import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import LinkButton from '@/components/ui/link-button';
import Image from 'next/image';
import { motion, useInView, useMotionValue, useSpring, animate } from '@/lib/motion';
import { ArrowRight, Sparkles, Shield, BarChart3, Globe } from 'lucide-react';

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
  { value: '50,000+', label: 'Agriculteurs actifs', icon: Globe },
  { value: '2.5M', label: 'Hectares suivis', icon: BarChart3 },
  { value: '12', label: 'Pays couverts', icon: Shield },
  { value: '98%', label: 'Précision IA', icon: Sparkles },
];

export function HeroSection() {
  return (
    <section
      className="landing-hero relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 pt-24"
      aria-label="Section héros"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.3),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.15),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.1),_transparent_50%)] animate-gradient" />

      {/* Animated grid overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating decorative orbs */}
      <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full bg-emerald-500/10 blur-[100px] animate-float-slow" />
      <div className="absolute bottom-40 right-[10%] w-96 h-96 rounded-full bg-blue-500/8 blur-[120px] animate-float-slow animation-delay-2000" />
      <div className="absolute top-1/3 right-[25%] w-48 h-48 rounded-full bg-violet-500/8 blur-[80px] animate-float-slow animation-delay-4000" />

      {/* Background image overlay */}
      <div className="absolute inset-0 z-[1]">
        <Image
          src="/fond-landscape.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-emerald-950/80 to-slate-950/95 z-[2]" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-[2]" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/25 bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-emerald-100 backdrop-blur-xl shadow-lg shadow-emerald-500/5">
            <div className="relative h-5 w-5">
              <Image
                src="/logo.png"
                alt=""
                fill
                className="object-contain"
                sizes="20px"
              />
            </div>
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Plateforme d&apos;intelligence agricole tout-en-un
          </div>
        </motion.div>

        {/* Main heading with gradient text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        >
          <h1 className="mt-8 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white">
              Gérez vos cultures, vos données
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400">
              et vos alertes en un seul endroit.
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg leading-8">
            AgriIntel360 combine l&apos;IA, les prévisions météo, le suivi de parcelles et les analyses de marché pour renforcer l&apos;agriculture africaine.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <LinkButton href="/register" variant="glow" size="xl" className="group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Créer un compte gratuit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </LinkButton>
            <LinkButton href="/login" variant="outline" size="xl" className="border-white/20 text-white hover:text-white hover:bg-white/10 backdrop-blur-sm">
              Se connecter
            </LinkButton>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-center">
            <Link href="#fonctionnalites" className="text-sm font-semibold text-emerald-300/80 hover:text-emerald-200 transition-colors">
              Voir les fonctionnalités
            </Link>
            <ArrowRight className="h-3 w-3 text-emerald-300/60" />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.23, 1, 0.32, 1] }}
          className="mt-16 w-full"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-5 text-left backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.08] hover:border-emerald-400/20 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Icon className="h-4 w-4 text-emerald-400/60 mb-3" />
                  <p className="text-3xl font-black text-white">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
