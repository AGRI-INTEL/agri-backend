import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTABanner() {
  return (
    <section className="relative overflow-hidden py-24 px-4" aria-labelledby="cta-heading">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-blue-900 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(16,185,129,0.3),_transparent_50%),radial-gradient(circle_at_70%_50%,_rgba(59,130,246,0.2),_transparent_50%)]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-10 left-[20%] w-48 h-48 rounded-full bg-emerald-400/10 blur-[80px] animate-float-slow" />
      <div className="absolute bottom-10 right-[20%] w-64 h-64 rounded-full bg-blue-400/10 blur-[100px] animate-float-reverse" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="rounded-[2.5rem] border border-white/[0.08] bg-white/[0.04] p-10 sm:p-16 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-emerald-200 mb-6">
                <Sparkles className="h-3 w-3" />
                Passez à l&apos;action
              </div>
              <h2 id="cta-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
                Prêt à transformer votre agriculture avec des analyses claires
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-blue-300"> et des alertes actionnables</span> ?
              </h2>
              <p className="mt-4 text-slate-300 text-base sm:text-lg leading-7 max-w-xl">
                Commencez en quelques minutes et bénéficiez d&apos;un accompagnement dédié pour votre exploitation.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:justify-end">
              <Button variant="glow" size="xl" asChild className="group relative overflow-hidden">
                <Link href="/register" className="flex items-center gap-2">
                  <span className="relative z-10">Créer un compte gratuit</span>
                  <ArrowRight className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" />
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              </Button>
              <Button variant="secondary" size="xl" asChild className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button variant="outline" size="xl" className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/40 font-semibold backdrop-blur-sm" asChild>
                <Link href="/contact">
                  Nous contacter
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
