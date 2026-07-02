'use client';

import { useRef } from 'react';
import { motion, useInView } from '@/lib/motion';
import { UserPlus, BellRing, BarChart3, LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: UserPlus,
    title: 'Inscrivez-vous',
    description:
      'Créez votre compte gratuitement en quelques clics. Accédez immédiatement aux données en temps réel, aux prévisions IA et à la communauté agricole.',
  },
  {
    icon: BellRing,
    title: 'Configurez vos alertes',
    description:
      'Personnalisez vos notifications par secteur, pays ou culture. Soyez informé des changements de prix, des risques climatiques et des opportunités.',
  },
  {
    icon: BarChart3,
    title: 'Prenez des décisions éclairées',
    description:
      'Consultez les analyses prédictives, comparez les indicateurs et échangez avec la communauté pour optimiser chaque décision agricole.',
  },
];

interface StepCardProps {
  step: Step;
  index: number;
}

function StepCard({ step, index }: StepCardProps) {
  const Icon = step.icon;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, {
    once: true,
    margin: '-60px',
  });

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center text-center rounded-xl p-8 bg-card/80 border border-border/20 transition-all duration-300 hover:border-border/40 hover:-translate-y-1 hover:shadow-xl"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: index * 0.15,
        duration: 0.55,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {/* Step number badge */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center w-7 h-7 bg-secondary text-secondary-foreground text-xs font-extrabold font-mono ring-4 ring-background"
        aria-hidden
      >
        {index + 1}
      </div>

      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-2xl mb-6 mt-2 h-[72px] w-[72px] bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/20"
        aria-hidden
      >
        <Icon className="w-8 h-8 text-secondary stroke-[1.5]" />
      </div>

      {/* Title */}
      <h3
        className="text-lg font-bold mb-3 text-foreground"
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed text-muted-foreground"
      >
        {step.description}
      </p>
    </motion.div>
  );
}

export function DemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  useInView(sectionRef as React.RefObject<Element>, { once: true, margin: '-100px' });

  return (
    <section
      id="demo"
      className="relative py-24 px-4 scroll-mt-24 overflow-hidden bg-background"
      aria-labelledby="demo-heading"
    >
      {/* Top separator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-px pointer-events-none bg-gradient-to-r from-transparent via-secondary/20 to-transparent"
        aria-hidden
      />

      {/* Radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,rgba(196,146,58,0.06)_0%,transparent_65%)]"
      />

      <div ref={sectionRef} className="relative mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] mb-4 text-secondary"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            COMMENT ÇA MARCHE
          </motion.p>
          <motion.h2
            id="demo-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.625rem)] font-bold italic tracking-[-0.02em] text-foreground"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.5 }}
          >
            De l&apos;inscription à l&apos;action
          </motion.h2>
          <motion.p
            className="mt-4 mx-auto text-base text-muted-foreground max-w-[520px] leading-[1.75]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            Trois étapes simples pour transformer les données agricoles en
            avantage concurrentiel.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>

        {/* Decorative bottom line */}
        <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[360px] h-px pointer-events-none bg-gradient-to-r from-transparent via-secondary/20 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
