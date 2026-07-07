'use client';

import { motion } from '@/lib/motion';
import { MessageSquare, Users, MapPin, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Topic = {
  id: string;
  title: string;
  replies: number;
  author: string;
  sector: string;
  tags: string[];
};

const FEATURED_TOPICS: Topic[] = [
  {
    id: 't1',
    title: 'Meilleures pratiques pour la culture du maïs en zone sahélienne',
    replies: 24,
    author: 'Amadou T.',
    sector: 'Végétal',
    tags: ['maïs', 'sécheresse', 'irrigation'],
  },
  {
    id: 't2',
    title: 'Prix du bétail — Tendances mars-juin 2026',
    replies: 18,
    author: 'Mariam K.',
    sector: 'Élevage',
    tags: ['marchés', 'bovins', 'prix'],
  },
  {
    id: 't3',
    title: 'Groupe coopératif Togo-Est — Recherche nouveaux membres',
    replies: 31,
    author: 'Koffi A.',
    sector: 'Coopérative',
    tags: ['togo', 'coopérative', 'entraide'],
  },
  {
    id: 't4',
    title: 'Prédiction pluviométrique — Saison des pluies 2026',
    replies: 47,
    author: 'Dr. Yao A.',
    sector: 'Recherche',
    tags: ['météo', 'prédiction', 'climat'],
  },
];

const COMMUNITY_STATS = [
  { icon: Users, value: '4 200+', label: 'Membres actifs' },
  { icon: MapPin, value: '18', label: 'Pays représentés' },
  { icon: MessageSquare, value: '12', label: 'Groupes régionaux' },
  { icon: TrendingUp, value: '850+', label: 'Discussions / mois' },
];

const TAGS = [
  { label: 'Togo', active: true },
  { label: 'Burkina Faso', active: false },
  { label: 'Côte d\'Ivoire', active: false },
  { label: 'Sénégal', active: false },
  { label: 'Ghana', active: false },
  { label: 'Bénin', active: false },
];

export function CommunitySection() {
  return (
    <section
      className="py-24 px-4 scroll-mt-20 relative overflow-hidden bg-background border-t border-b border-border/20"
      id="communaute"
      aria-labelledby="community-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(196,146,58,0.04)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="mb-14">
          <motion.p
            className="text-[0.6875rem] font-bold uppercase tracking-[0.24em] mb-3 text-secondary"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            COMMUNAUTÉ AGRICOLE
          </motion.p>
          <motion.h2
            id="community-heading"
            className="font-display text-[clamp(1.75rem,3.2vw,2.625rem)] font-bold italic tracking-[-0.02em] leading-[1.18] text-foreground"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Des producteurs du monde rural <br />
            <span className="text-secondary">partagent et progressent ensemble</span>
          </motion.h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] mb-14">
          {/* Topics */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold tracking-wider uppercase text-muted-foreground/70">
                Discussions récentes
              </h3>
              <Link
                href="/community"
                className="text-xs font-medium text-secondary hover:text-secondary/80 transition-colors"
              >
                Voir tout
              </Link>
            </div>

            <ul className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {FEATURED_TOPICS.map((topic, i) => (
                <motion.li
                  key={topic.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <article className="group relative flex items-start gap-4 p-4 rounded-xl bg-card/40 border border-border/10 hover:bg-card/70 hover:border-border/25 transition-all duration-300">
                    <div className="shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-secondary/10 border border-secondary/15 text-sm mt-0.5">
                      {topic.sector === 'Végétal' ? '🌾' : topic.sector === 'Élevage' ? '🐄' : topic.sector === 'Coopérative' ? '🤝' : '🔬'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors leading-snug">
                        {topic.title}
                      </h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                        {topic.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[0.6875rem] font-medium px-2 py-0.5 rounded-full bg-secondary/8 text-secondary/70 border border-secondary/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[0.75rem] text-muted-foreground">
                        <span>Par {topic.author}</span>
                        <span className="text-muted-foreground/30" aria-hidden="true">·</span>
                        <span>{topic.replies} réponses</span>
                      </div>
                    </div>

                    <ArrowRight
                      size={16}
                      className="shrink-0 mt-2 text-muted-foreground/30 group-hover:text-secondary group-hover:translate-x-0.5 transition-all"
                    />
                  </article>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {COMMUNITY_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 + 0.15, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-card/40 border border-border/10 text-center"
                >
                  <stat.icon size={18} className="text-secondary/70" />
                  <span className="text-lg font-bold tabular-nums text-foreground">{stat.value}</span>
                  <span className="text-[0.6875rem] text-muted-foreground leading-tight">{stat.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="p-5 rounded-xl bg-card/40 border border-border/10"
            >
              <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground/70 mb-3">
                Par pays
              </h3>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <span
                    key={tag.label}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      padding: '0.25rem 0.625rem',
                      borderRadius: '999px',
                      background: tag.active
                        ? 'rgba(196,146,58,0.12)'
                        : 'rgba(255,255,255,0.04)',
                      color: tag.active
                        ? '#C4923A'
                        : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${
                        tag.active ? 'rgba(196,146,58,0.2)' : 'rgba(255,255,255,0.06)'
                      }`,
                      cursor: tag.active ? 'default' : 'pointer',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Join CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-sm font-bold text-background transition-all duration-200 hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
                }}
              >
                <Users size={16} />
                Rejoindre la communauté
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Testimonials inline — community voices */}
        <div className="border-t border-border/10 pt-12">
          <motion.p
            className="text-[0.6875rem] font-bold uppercase tracking-[0.24em] mb-6 text-secondary/70 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Témoignages de la communauté
          </motion.p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                name: 'Kofi Mensah',
                role: 'Producteur, Ghana',
                quote: 'Les alertes météo nous ont évité deux mauvaises récoltes cette année.',
              },
              {
                name: 'Aminata Diallo',
                role: 'Coopérative, Sénégal',
                quote: 'Les données sur les prix des marchés nous permettent de mieux négocier.',
              },
              {
                name: 'Dr. Yao Akakpo',
                role: 'Chercheur, Togo',
                quote: 'La précision des modèles prédictifs est remarquable pour notre région.',
              },
            ].map((t, i) => (
              <div
                key={t.name}
                className="relative p-5 rounded-xl bg-card/30 border border-border/10"
              >
                <p className="text-sm italic leading-relaxed text-muted-foreground mb-3">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="text-[0.75rem] font-bold text-foreground/80">
                  {t.name}
                  <span className="block text-[0.6875rem] font-normal text-muted-foreground mt-0.5">
                    {t.role}
                  </span>
                </footer>
                </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
