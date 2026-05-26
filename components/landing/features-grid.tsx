'use client';

import { useRef } from 'react';
import { motion, useInView } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Brain, BarChart3, MapPin, Bell, Users, FolderOpen } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AgriBot IA',
    description: 'Posez vos questions en langage naturel et obtenez des recommandations terrain précises.',
    bg: 'bg-violet-500/10',
  },
  {
    icon: BarChart3,
    title: 'Tableau de bord',
    description: 'Suivez vos indicateurs clés, prévisions de récolte et tendances de marché en un coup d’œil.',
    bg: 'bg-blue-500/10',
  },
  {
    icon: MapPin,
    title: 'Carte interactive',
    description: 'Visualisez les champs, alertes météo et points de collecte sur une carte simple et claire.',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Bell,
    title: 'Alertes intelligentes',
    description: 'Recevez des notifications sur le climat, les prix et les risques de ravageurs.',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Collaborez avec d’autres agriculteurs et experts locaux autour des meilleures pratiques.',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: FolderOpen,
    title: 'Gestion de documents',
    description: 'Stockez photos, rapports et documents de ferme dans un espace sécurisé.',
    bg: 'bg-rose-500/10',
  },
];

export function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-100px' });

  return (
    <section
      className="landing-section py-32 px-4 bg-slate-950 text-white scroll-mt-24 relative overflow-hidden"
      id="fonctionnalites"
      aria-labelledby="features-heading"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] translate-y-1/2" />

      <div className="max-w-content mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
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
            Une solution complète pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">l&apos;agriculture moderne</span>
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

        <div ref={ref} className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group relative rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm p-10 transition-all duration-500 hover:bg-white/[0.05] hover:border-white/10 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="relative z-10"
                >
                  <div className={cn(
                    'mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
                    feature.bg
                  )}>
                    <Icon className={cn('h-9 w-9 text-emerald-400')} aria-hidden />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {feature.description}
                  </p>
                </motion.div>

                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
