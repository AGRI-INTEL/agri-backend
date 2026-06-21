'use client';

import { useRef } from 'react';
import { motion, useInView } from '@/lib/motion';
import { BarChart2, Brain, Bell, Users, Map, MessageSquare } from 'lucide-react';

const FEATURES = [
  {
    icon: BarChart2,
    title: 'Données temps réel',
    description:
      'Prix des marchés, volumes de production et indicateurs économiques actualisés quotidiennement pour 12 pays.',
  },
  {
    icon: Brain,
    title: 'IA Prédictive',
    description:
      'Modèles de prévision météo, rendements et risques phytosanitaires entraînés sur 10 ans de données africaines.',
  },
  {
    icon: Bell,
    title: 'Alertes intelligentes',
    description:
      'Notifications personnalisées sur les crises, opportunités et changements de prix qui impactent votre activité.',
  },
  {
    icon: Users,
    title: 'Communauté',
    description:
      'Échangez avec 50 000+ agriculteurs, coopératives et institutions à travers l\'Afrique de l\'Ouest.',
  },
  {
    icon: Map,
    title: 'Cartographie interactive',
    description:
      'Visualisez zones de production, réseaux de distribution et données géospatiales sur carte.',
  },
  {
    icon: MessageSquare,
    title: 'Assistant IA',
    description:
      'Chatbot expert disponible 24h/24 pour répondre à vos questions agronomiques en français, anglais et langues locales.',
  },
];

export function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-80px' });

  return (
    <section
      id="fonctionnalites"
      className="relative py-24 px-4 scroll-mt-20"
      aria-labelledby="features-heading"
      style={{ background: '#07100A' }}
    >
      {/* Top separator line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(196,146,58,0.22), transparent)',
        }}
        aria-hidden
      />

      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-14 text-center">
          <motion.p
            className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] mb-4"
            style={{ color: '#C4923A' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            FONCTIONNALITÉS
          </motion.p>
          <motion.h2
            id="features-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.625rem)] font-bold italic tracking-[-0.02em]"
            style={{ color: '#E4DBC8' }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.5 }}
          >
            Tout ce dont vous avez besoin
          </motion.h2>
        </div>

        {/* Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                className="group relative flex flex-col gap-4 rounded-2xl p-7 cursor-default"
                style={{
                  background: 'rgba(17,29,20,0.8)',
                  border: '1px solid rgba(196,146,58,0.12)',
                  transition:
                    'border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
                }}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  delay: index * 0.1,
                  duration: 0.55,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(196,146,58,0.35)';
                  el.style.transform = 'translateY(-4px)';
                  el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(196,146,58,0.12)';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                {/* Icon */}
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #1E6B3E 0%, #14532d 100%)',
                  }}
                  aria-hidden
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: '#ffffff', strokeWidth: 1.75 }}
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2">
                  <h3
                    className="text-base font-bold leading-snug"
                    style={{ color: '#E4DBC8' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-[0.875rem]"
                    style={{ color: '#5E7A68', lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
