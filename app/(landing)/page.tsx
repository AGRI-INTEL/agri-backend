import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { SectorShowcase } from '@/components/landing/sector-showcase';
import { TestimonialCarousel } from '@/components/landing/testimonial-carousel';
import { PricingCards } from '@/components/landing/pricing-cards';
import { CTABanner } from '@/components/landing/cta-banner';

export const metadata: Metadata = {
  title: 'AgriIntel360 — Intelligence Agricole pour l\'Afrique',
  description:
    'Plateforme intelligente de décision agricole pour l\'Afrique. IA prédictive, données temps réel, alertes et communauté pour les 4 sous-secteurs agricoles.',
  openGraph: {
    type: 'website',
    url: 'https://agriintel360.com',
    title: 'AgriIntel360 — Intelligence Agricole pour l\'Afrique',
    description: 'Plateforme intelligente de décision agricole pour l\'Afrique.',
    siteName: 'AgriIntel360',
    images: [
      {
        url: '/fond-landscape.jpg',
        width: 1200,
        height: 630,
        alt: 'AgriIntel360 — Intelligence agricole pour l\'Afrique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriIntel360',
    description: 'Intelligence agricole pour l\'Afrique',
    images: ['/fond-landscape.jpg'],
  },
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      <section className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-content mx-auto grid gap-8 lg:grid-cols-3 items-center">
          <div className="lg:col-span-2">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-300 mb-4">Confiance & performance</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              Des données fiables pour des décisions rapides et efficaces.
            </h2>
            <p className="mt-5 max-w-2xl text-slate-200 text-base sm:text-lg leading-8">
              AgriIntel360 offre des alertes climatiques, des prévisions de rendement et des analyses de marché pour aider vos équipes à agir au bon moment.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { label: 'Réduction du risque', value: '82%' },
              { label: 'Amélioration de rendement', value: '34%' },
              { label: 'Couverture multi-pays', value: '12+' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-green/5 backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">{item.value}</p>
                <p className="mt-2 text-sm text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturesGrid />
      <SectorShowcase />
      <TestimonialCarousel />
      <PricingCards />
      <CTABanner />
    </>
  );
}
