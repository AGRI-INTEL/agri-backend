import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_CONTACT_EMAIL, APP_SUPPORT_PHONE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact — AgriIntel360',
  description: 'Contactez AgriIntel360 pour une démo, un accompagnement ou une question sur nos solutions agricoles.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 px-4 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-cyan-200">
                Contactez notre équipe
              </span>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Parlez-nous de votre projet agricole.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-200">
                Que vous cherchiez à automatiser les prévisions de récolte, planifier vos intrants ou améliorer la qualité du sol, nous sommes là pour vous aider.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Disponible du lundi au vendredi</p>
              <p className="mt-4 text-2xl font-semibold text-white">Réponse rapide</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Notre équipe technique et nos conseillers terrain sont prêts à vous accompagner sur mesure.
              </p>
              <div className="mt-8 space-y-3 text-sm text-slate-200">
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <a href={`mailto:${APP_CONTACT_EMAIL}`} className="text-cyan-200 hover:underline">
                    {APP_CONTACT_EMAIL}
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-white">Téléphone</p>
                  <a href={`tel:${APP_SUPPORT_PHONE.replace(/[^+0-9]/g, '')}`} className="text-cyan-200 hover:underline">
                    {APP_SUPPORT_PHONE}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div className="landing-panel rounded-[2rem] border-slate-200/10 p-10 shadow-xl shadow-slate-900/5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Laissez-nous un message
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Écrivez-nous directement.
            </h2>
            <p className="mt-4 text-slate-600 leading-7">
              Utilisez le formulaire ci-dessous pour partager vos besoins, et nous vous recontacterons rapidement.
            </p>

            <form className="mt-10 grid gap-6">
              <label className="grid gap-2 text-sm text-slate-700">
                Nom complet
                <input
                  type="text"
                  placeholder="Votre nom"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Email
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Objet
                <input
                  type="text"
                  placeholder="Ex: Demande de démonstration"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Message
                <textarea
                  rows={5}
                  placeholder="Décrivez votre projet ou votre question..."
                  className="min-h-[140px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Vous pouvez aussi nous écrire directement à&nbsp;
                  <Link href={`mailto:${APP_CONTACT_EMAIL}`} className="font-semibold text-primary underline">
                    {APP_CONTACT_EMAIL}
                  </Link>
                </p>
                <Button asChild size="lg">
                  <a href={`mailto:${APP_CONTACT_EMAIL}`}>Envoyer un message</a>
                </Button>
              </div>
            </form>
          </div>

          <div className="landing-panel space-y-8 rounded-[2rem] border-slate-200/10 p-10 shadow-xl shadow-slate-900/5">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Besoin d’un accompagnement personnalisé ?</p>
              <h3 className="text-2xl font-semibold text-slate-950">Nous sommes à votre écoute.</h3>
            </div>
            <div className="grid gap-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Support</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{APP_SUPPORT_PHONE}</p>
                <p className="mt-1 text-sm text-slate-500">Disponible 9h-18h, du lundi au vendredi.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{APP_CONTACT_EMAIL}</p>
                <p className="mt-1 text-sm text-slate-500">Réponse garantie sous 24h ouvrées.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Notre mission</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">Accompagner l’agriculture africaine avec des données modernes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
