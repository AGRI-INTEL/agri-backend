'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS, SECTOR_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePersistentState } from '@/hooks/use-persistent-state';

export function TestimonialCarousel() {
  const [current, setCurrent] = usePersistentState('landing-testimonial', 0);
  const total = TESTIMONIALS.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((value: number) => (value + 1) % total);
    }, 8000);
    return () => clearInterval(timer);
  }, [total, setCurrent]);

  const prev = useCallback(() => setCurrent((value: number) => (value - 1 + total) % total), [setCurrent, total]);
  const next = useCallback(() => setCurrent((value: number) => (value + 1) % total), [setCurrent, total]);
  const testimonial = TESTIMONIALS[current];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  return (
    <section
      className="py-32 px-4 bg-white scroll-mt-24 relative overflow-hidden"
      id="temoignages"
      aria-labelledby="testimonials-heading"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-content mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-slate-600 border border-slate-200/50">
                Témoignages
              </span>
            </motion.div>
            <motion.h2
              id="testimonials-heading"
              className="mt-6 text-4xl sm:text-5xl font-black text-slate-900 tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Impact sur le{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">
                terrain
              </span>
            </motion.h2>
          </div>
          <motion.p
            className="text-slate-500 text-lg max-w-sm leading-relaxed text-center md:text-left"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Des résultats concrets et une meilleure coordination pour les équipes qui nourrissent l&apos;Afrique.
          </motion.p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-16 lg:p-20 shadow-2xl shadow-slate-900/30"
            >
              <Quote className="absolute top-10 right-10 h-32 w-32 text-white/[0.04] -rotate-12 select-none" aria-hidden />

              <div className="relative z-10 grid lg:grid-cols-[1fr_0.4fr] gap-12 items-center">
                <div>
                  <div className="flex gap-1.5 mb-8">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          'h-6 w-6 transition-all duration-300',
                          index < testimonial.rating ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-slate-700'
                        )}
                        aria-hidden
                      />
                    ))}
                  </div>

                  <blockquote className="text-2xl sm:text-3xl lg:text-4xl leading-tight text-white mb-12 font-black tracking-tight italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white text-2xl font-black shadow-xl shadow-emerald-500/20 rotate-3">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xl font-black text-white tracking-tight">{testimonial.name}</p>
                      <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mt-1">
                        {testimonial.role} <span className="text-slate-600 mx-2">|</span> {testimonial.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block relative aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-glow" />
                  <div className="relative h-full w-full rounded-[2rem] bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm flex items-center justify-center overflow-hidden group">
                    <span className="text-[120px] transition-all duration-700 group-hover:scale-125 group-hover:rotate-6 select-none">
                      {SECTOR_CONFIG[testimonial.sector].emoji}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex flex-col items-center gap-8 sm:flex-row sm:justify-between px-4">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              <Button
                variant="outline"
                size="icon-lg"
                onClick={prev}
                className="rounded-2xl bg-white hover:border-emerald-500 hover:text-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 active:scale-90 transition-all duration-300"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={next}
                className="rounded-2xl bg-white hover:border-emerald-500 hover:text-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 active:scale-90 transition-all duration-300"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex items-center gap-2.5 order-1 sm:order-2">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={cn(
                    'rounded-full transition-all duration-500',
                    index === current
                      ? 'w-10 h-2 bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/30'
                      : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                  )}
                  aria-label={`Témoignage ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
