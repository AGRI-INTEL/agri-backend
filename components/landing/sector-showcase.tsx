'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { SECTOR_SHOWCASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { usePersistentState } from '@/hooks/use-persistent-state';

export function SectorShowcase() {
  const [active, setActive] = usePersistentState('landing-sector-active', 0);
  const [imageError, setImageError] = usePersistentState(`sector-img-error-${active}`, false);
  const sector = SECTOR_SHOWCASE[active];

  useEffect(() => {
    setImageError(false);
  }, [active, setImageError]);

  const handleTabChange = useCallback((index: number) => {
    setActive(index);
  }, [setActive]);

  return (
    <section
      className="py-32 px-4 bg-white scroll-mt-24 overflow-hidden relative"
      id="secteurs"
      aria-labelledby="sectors-heading"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-content mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 border border-emerald-200/50">
                Secteurs d&apos;activité
              </span>
            </motion.div>
            <motion.h2
              id="sectors-heading"
              className="mt-6 text-4xl sm:text-5xl font-black text-slate-900 tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Une expertise par{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">
                filière agricole
              </span>
            </motion.h2>
          </div>
          <motion.p
            className="text-slate-500 text-lg max-w-sm leading-relaxed"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Nos outils s&apos;adaptent aux spécificités de chaque métier pour vous offrir un suivi métier précis.
          </motion.p>
        </div>

        <div className="flex flex-wrap gap-3 mb-16">
          {SECTOR_SHOWCASE.slice(0, 6).map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active === index}
              onClick={() => handleTabChange(index)}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold transition-all duration-300 border-2',
                active === index
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/25'
                  : 'bg-slate-50/80 border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50'
              )}
            >
              <span className={cn(
                'text-xl transition-all duration-300',
                active === index ? 'scale-110' : 'group-hover:scale-110'
              )}>
                {item.emoji}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={sector.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="grid gap-12 lg:grid-cols-[1fr_1fr] items-center bg-gradient-to-br from-slate-50 to-white rounded-[3rem] p-8 sm:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50"
          >
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-white aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center border border-slate-100 shadow-inner">
              {!imageError ? (
                <Image
                  src={sector.image}
                  alt={sector.label}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={() => setImageError(true)}
                  priority={active === 0}
                  loading={active === 0 ? undefined : 'lazy'}
                />
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-[160px] sm:text-[200px] drop-shadow-2xl select-none z-10"
                >
                  {sector.emoji}
                </motion.div>
              )}

              {imageError && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white -z-10" />
                  <div
                    className="absolute h-[80%] w-[80%] rounded-full blur-[80px] opacity-15 -z-10 animate-pulse-glow"
                    style={{ backgroundColor: sector.color }}
                  />
                </>
              )}

              <div className="absolute left-6 bottom-6 rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-xl border border-white/80 z-20">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Impact terrain</p>
                <p className="text-sm font-bold text-slate-900">{sector.stats}</p>
              </div>
            </div>

            <div className="space-y-8 lg:pl-4">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-6">
                    Filière {sector.label}
                  </h3>
                  <p className="text-xl text-slate-500 leading-relaxed font-medium">
                    {sector.description}
                  </p>
                </motion.div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {sector.features.map((feature, i) => (
                  <motion.div
                    key={feature}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.04 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-sm">
                      <Check className="h-4 w-4" aria-hidden />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <Button size="xl" className="rounded-2xl gap-3 group shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-emerald-600 hover:to-emerald-500 text-white border-0" asChild>
                  <Link href={`/${sector.id === 'vegetal' ? 'production' : sector.id}`}>
                    Accéder aux outils {sector.label}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
