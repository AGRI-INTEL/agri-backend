import type { Metadata } from 'next';
import { MapPageClient } from '@/components/map/map-page-client';

export const metadata: Metadata = { 
  title: 'Carte Interactive | Agri Intel',
  description: 'Explorez la carte interactive avec des marqueurs agricoles, des prédictions et des alertes'
};

export default function MapPage() {
  return <MapPageClient />;
}
