import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/landing/hero-section';
import { AnimatedStatsBar } from '@/components/landing/stats-bar';

const FeaturesGrid = dynamic(() => import('@/components/landing/features-grid').then(m => m.FeaturesGrid), { ssr: true });
const SectorShowcase = dynamic(() => import('@/components/landing/sector-showcase').then(m => m.SectorShowcase), { ssr: true });
const TestimonialCarousel = dynamic(() => import('@/components/landing/testimonial-carousel').then(m => m.TestimonialCarousel), { ssr: true });
const PricingCards = dynamic(() => import('@/components/landing/pricing-cards').then(m => m.PricingCards), { ssr: true });
const CTABanner = dynamic(() => import('@/components/landing/cta-banner').then(m => m.CTABanner), { ssr: true });

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
      <AnimatedStatsBar />

      <FeaturesGrid />
      <SectorShowcase />
      <TestimonialCarousel />
      <PricingCards />
      <CTABanner />
    </>
  );
}
