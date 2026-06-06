'use client';

import { useRef } from 'react';
import { motion, useInView } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Brain, BarChart3, MapPin, Bell, Users, FolderOpen, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AgriBot IA',
    description: 'Posez vos questions en langage naturel et obtenez des recommandations terrain précises.',
    gradient: 'from-violet-500/20 to-violet-500/5',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    borderGlow: 'group-hover:border-violet-500/30',
  },
  {
    icon: BarChart3,
    title: 'Tableau de bord',
    description: 'Suivez vos indicateurs clés, prévisions de récolte et tendances de marché en un coup d\'œil.',
    gradient: 'from-blue-500/20 to-blue-500/5',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    borderGlow: 'group-hover:border-blue-500/30',
  },
  {
    icon: MapPin,
    title: 'Carte interactive',
    description: 'Visualisez les champs, alertes météo et points de collecte sur une carte simple et claire.',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    borderGlow: 'group-hover:border-cyan-500/30',
  },
  {
    icon: Bell,
    title: 'Alertes intelligentes',
    description: 'Recevez des notifications sur le climat, les prix et les risques de ravageurs.',
    gradient: 'from-amber-500/20 to-amber-500/5',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    borderGlow: 'group-hover:border-amber-500/30',
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Collaborez avec d\'autres agriculteurs et experts locaux autour des meilleures pratiques.',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    borderGlow: 'group-hover:border-emerald-500/30',
  },
  {
    icon: FolderOpen,
    title: 'Gestion de documents',
    description: 'Stockez photos, rapports et documents de ferme dans un espace sécurisé.',
    gradient: 'from-rose-500/20 to-rose-500/5',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-400',
    borderGlow: 'group-hover:border-rose-500/30',
  },
];

export function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-100px' });

  return (
    <section
      className="relative overflow-hidden py-32 px-4 bg-slate-950 text-white scroll-mt-24"
      id="fonctionnalites"
      aria-labelledby="features-heading"
    >
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.03),_transparent_70%)]" />

      <div className="max-w-content mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
              <Sparkles className="h-3 w-3" />
              Notre Écosystème
            </span>
          </motion.div>
          <motion.h2
            id="features-heading"
            className="mt-6 text-4xl sm:text-5xl font-black text-white tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Une solution complète pour{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400">
              l&apos;agriculture moderne
            </span>
          </motion.h2>
          <motion.p
            className="mt-6 text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Tous les outils dont vous avez besoin : intelligence terrain, suivi des cultures, analyse des prix et collaboration locale.
          </motion.p>
        </div>

        <div ref={ref} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={cn(
                  'group relative rounded-[2rem] border border-white/[0.06] bg-gradient-to-br p-10',
                  'transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5',
                  feature.gradient,
                  feature.borderGlow
                )}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="relative z-10"
                >
                  <div className={cn(
                    'mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] shadow-lg',
                    'transition-all duration-500 group-hover:scale-110 group-hover:rotate-2',
                    feature.iconBg
                  )}>
                    <Icon className={cn('h-8 w-8', feature.iconColor)} aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-emerald-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </motion.div>

                {/* Hover glow effect */}
                <div className={cn(
                  'absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
                  'bg-gradient-to-br from-transparent via-white/[0.02] to-white/[0.04]'
                )} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
