'use client';
import { Beef } from 'lucide-react';
import { SectorDashboard } from '@/components/actors/sector-dashboard';

export default function AnimalPage() {
  return (
    <SectorDashboard
      sector="animal"
      title="Secteur Animal"
      description="Éleveurs, cheptel et production animale"
      icon={Beef}
      color="#D97706"
      backgroundImage="/images/sectors/animal.jpg"
    />
  );
}
