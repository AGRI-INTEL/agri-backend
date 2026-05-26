'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS, SECTOR_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const total = TESTIMONIALS.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((value) => (value + 1) % total);
    }, 8000);
    return () => clearInterval(timer);
  }, [total]);

  const prev = () => setCurrent((value) => (value - 1 + total) % total);
  const next = () => setCurrent((value) => (value + 1) % total);
  const testimonial = TESTIMONIALS[current];

  return (
    <section
      className="py-32 px-4 bg-white scroll-mt-24 relative overflow-hidden"
      id="temoignages"
      aria-labelledby="testimonials-heading"
    >
      {/* Background decorations */}
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
              <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-slate-600">
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
              Impact sur le <span className="text-emerald-600">terrain</span>
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
              className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 sm:p-16 lg:p-20 shadow-2xl shadow-slate-900/20"
            >
              <Quote className="absolute top-10 right-10 h-32 w-32 text-white/5 -rotate-12 select-none" aria-hidden />
              
              <div className="relative z-10 grid lg:grid-cols-[1fr_0.4fr] gap-12 items-center">
                <div>
                  <div className="flex gap-1.5 mb-8">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          'h-6 w-6 transition-transform duration-300 hover:scale-125',
                          index < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        )}
                        aria-hidden
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-2xl sm:text-3xl lg:text-4xl leading-tight text-white mb-12 font-black tracking-tight italic">
                    “{testimonial.quote}”
                  </blockquote>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-2xl font-black shadow-xl rotate-3">
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
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow" />
                  <div className="relative h-full w-full rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden group">
                    <span className="text-[120px] transition-transform duration-700 group-hover:scale-125 select-none">
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
                aria-label="Précédent"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={next}
                className="rounded-2xl bg-white hover:border-emerald-500 hover:text-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 active:scale-90 transition-all duration-300"
                aria-label="Suivant"
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
                    'h-1.5 rounded-full transition-all duration-500',
                    index === current ? 'w-10 bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'w-2 bg-slate-200 hover:bg-slate-300'
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
