import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

export function CTABanner() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 text-white" aria-labelledby="cta-heading">
      <div className="max-w-5xl mx-auto rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/80 mb-4">Passez à l’action</p>
            <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold leading-tight">Prêt à transformer votre agriculture avec des analyses claires et des alertes actionnables ?</h2>
            <p className="mt-4 text-slate-100/90 text-base sm:text-lg leading-7">
              Commencez en quelques minutes et bénéficiez d’un accompagnement dédié pour votre exploitation.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
            <Button variant="glow" size="xl" asChild>
              <Link href="/register">Créer un compte gratuit</Link>
            </Button>
            <Button variant="secondary" size="xl" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button variant="outline" size="xl" className="border-white/40 text-white hover:bg-white/10 hover:text-white font-semibold" asChild>
              <Link href="/contact">
                <Phone className="h-5 w-5 mr-2" aria-hidden="true" />
                Nous contacter
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
