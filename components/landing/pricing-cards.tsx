'use client';

import { motion } from '@/lib/motion';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { PRICING_PLANS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePersistentState } from '@/hooks/use-persistent-state';

function formatPrice(value: number): string {
  return value.toLocaleString('fr-FR');
}

export function PricingCards() {
  const [annual, setAnnual] = usePersistentState('landing-pricing-annual', false);

  return (
    <section className="py-32 px-4 bg-slate-50 scroll-mt-24 relative overflow-hidden" id="tarifs" aria-labelledby="pricing-heading">
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -translate-x-1/2" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.02),_transparent_60%)]" />

      <div className="max-w-content mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-emerald-600">
              Nos Offres
            </span>
          </motion.div>
          <motion.h2
            id="pricing-heading"
            className="mt-6 text-4xl sm:text-5xl font-black text-slate-900 tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Choisissez le plan qui vous fait{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">
              gagner du temps
            </span>
          </motion.h2>

          <motion.div
            className="mt-12 inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/50"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                'rounded-xl px-8 py-3 text-sm font-bold transition-all duration-300',
                !annual
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                'rounded-xl px-8 py-3 text-sm font-bold transition-all duration-300 flex items-center gap-3',
                annual
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              Annuel
              <span className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
                -20%
              </span>
            </button>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <article
              key={plan.id}
              className={cn(
                'relative overflow-hidden rounded-[3rem] border p-10 flex flex-col transition-all duration-500 group',
                plan.highlighted
                  ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-[0_32px_80px_rgba(15,23,42,0.3)] scale-[1.05] z-10 text-white'
                  : 'bg-white border-slate-100 hover:shadow-2xl hover:shadow-slate-200/60 hover:border-slate-200 text-slate-900'
              )}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col h-full"
              >
                {plan.highlighted && (
                  <>
                    <div className="absolute top-0 right-0 p-8 opacity-[0.04]">
                      <Star className="h-32 w-32 rotate-12" fill="white" />
                    </div>
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                  </>
                )}

                <div className="mb-10 relative z-10">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <h3 className={cn(
                      'text-2xl font-black tracking-tight',
                      plan.highlighted ? 'text-white' : 'text-slate-900'
                    )}>{plan.name}</h3>
                    <span className={cn(
                      'rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest',
                      plan.highlighted ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm' : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-600'
                    )}>{plan.badge}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    {plan.price_monthly !== null ? (
                      <>
                        <span className="text-5xl font-black tracking-tighter">{formatPrice(annual ? (plan.price_annual || 0) : plan.price_monthly)}</span>
                        <div className="flex flex-col">
                          <span className={cn('text-xs font-bold uppercase tracking-widest', plan.highlighted ? 'text-slate-400' : 'text-slate-500')}>
                            {plan.currency}
                          </span>
                          <span className={cn('text-xs font-medium', plan.highlighted ? 'text-slate-500' : 'text-slate-400')}>
                            /mois
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-4xl font-black tracking-tighter">Sur devis</p>
                    )}
                  </div>
                </div>

                <div className={cn(
                  'h-px w-full mb-10',
                  plan.highlighted ? 'bg-white/[0.08]' : 'bg-slate-200'
                )} />

                <ul className="mb-12 space-y-4 flex-1 relative z-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-4 text-sm font-medium">
                      <div className={cn(
                        'mt-0.5 shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full',
                        plan.highlighted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      )}>
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                      </div>
                      <span className={plan.highlighted ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="xl"
                  className={cn(
                    'mt-auto rounded-2xl py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-lg',
                    plan.highlighted
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
                  )}
                >
                  <Link href={plan.id === 'enterprise' ? '/contact' : '/register'}>{plan.cta}</Link>
                </Button>
              </motion.div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
