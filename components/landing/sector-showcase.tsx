'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { SECTOR_SHOWCASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function SectorShowcase() {
  const [active, setActive] = useState(0);
  const [imageError, setImageError] = useState(false);
  const sector = SECTOR_SHOWCASE[active];

  // Reset image error when sector changes
  useEffect(() => {
    setImageError(false);
  }, [active]);

  return (
    <section
      className="py-32 px-4 bg-white scroll-mt-24 overflow-hidden"
      id="secteurs"
      aria-labelledby="sectors-heading"
    >
      <div className="max-w-content mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-slate-600">
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
              Une expertise par <span className="text-emerald-600">filière agricole</span>
            </motion.h2>
          </div>
          <motion.p 
            className="text-slate-500 text-lg max-w-sm leading-relaxed"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Nos outils s’adaptent aux spécificités de chaque métier pour vous offrir un suivi métier précis.
          </motion.p>
        </div>

        <div className="flex flex-wrap gap-3 mb-16">
          {SECTOR_SHOWCASE.slice(0, 6).map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active === index}
              onClick={() => setActive(index)}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold transition-all duration-300 border-2',
                active === index
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
                  : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-white hover:shadow-md'
              )}
            >
              <span className={cn(
                "text-xl transition-transform duration-300 group-hover:scale-125",
                active === index ? "scale-110" : ""
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
            className="grid gap-12 lg:grid-cols-[1fr_1fr] items-center bg-slate-50 rounded-[3rem] p-8 sm:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50"
          >
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-white aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center border border-slate-100 shadow-inner">
              {!imageError ? (
                <Image
                  src={sector.image}
                  alt={sector.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={() => setImageError(true)}
                  priority={active === 0}
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
              
              {/* Decorative circles - only show with emoji */}
              {imageError && (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-white to-slate-50 -z-10" />
                  <div 
                    className="absolute h-[80%] w-[80%] rounded-full blur-[80px] opacity-20 -z-10 animate-pulse-slow" 
                    style={{ backgroundColor: sector.color }}
                  />
                </>
              )}

              <div className="absolute left-8 bottom-8 rounded-2xl bg-white/90 backdrop-blur-md p-5 shadow-xl border border-white/50 z-20">
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

              <div className="grid sm:grid-cols-2 gap-4">
                {sector.features.map((feature, i) => (
                  <motion.div 
                    key={feature} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                      <Check className="h-5 w-5" aria-hidden />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <Button size="xl" className="rounded-2xl gap-3 group shadow-xl hover:shadow-emerald-500/20 transition-all duration-300" asChild>
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
