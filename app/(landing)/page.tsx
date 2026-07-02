import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero-section';
import { AnimatedStatsBar } from '@/components/landing/stats-bar';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { SectorShowcase } from '@/components/landing/sector-showcase';
import { DemoSection } from '@/components/landing/demo-section';
import { TestimonialCarousel } from '@/components/landing/testimonial-carousel';
import { PricingCards } from '@/components/landing/pricing-cards';
import { CTABanner } from '@/components/landing/cta-banner';

export const metadata: Metadata = {
  title: 'AgriIntel360 — Intelligence Agricole pour l\'Afrique',
  description:
    'Plateforme intelligente de décision agricole pour l\'Afrique. IA prédictive, données temps réel, alertes et communauté pour les 4 sous-secteurs agricoles.',
  openGraph: {
    type: 'website',
    url: 'https://agriintel360.lsgrouptogo.com',
    title: 'AgriIntel360 — Intelligence Agricole pour l\'Afrique',
    description: 'Plateforme intelligente de décision agricole pour l\'Afrique.',
    siteName: 'AgriIntel360',
    images: [
      {
        url: '/images/og-default.svg',
        width: 1200,
        height: 630,
        alt: 'AgriIntel360 — Intelligence Agricole pour l\'Afrique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriIntel360',
    description: 'Intelligence agricole pour l\'Afrique',
    images: ['/images/og-default.svg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AgriIntel360',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: "Plateforme Intelligente de Décision Agricole pour l'Afrique",
  url: 'https://agriintel360.lsgrouptogo.com',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'XOF' },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <AnimatedStatsBar />

      <FeaturesGrid />
      <SectorShowcase />
      <DemoSection />
      <TestimonialCarousel />
      <PricingCards />
      <CTABanner />
    </>
  );
}
