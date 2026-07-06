'use client';
import { Fish } from 'lucide-react';
import { SectorDashboard } from '@/components/actors/sector-dashboard';

export default function HalieutiquePage() {
  return (
    <SectorDashboard
      sector="halieutique"
      title="Secteur Halieutique"
      description="Pêcheurs, flotte et ressources halieutiques"
      icon={Fish}
      color="#0891B2"
      backgroundImage="/images/sectors/halieutique.webp"
    />
  );
}
