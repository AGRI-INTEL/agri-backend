'use client';

import { Sprout } from 'lucide-react';
import { SectorActorsPage } from '@/components/actors/sector-actors-page';

export default function ProductionPage() {
  return (
    <SectorActorsPage
      sector="vegetal"
      title="Secteur Végétal"
      description="Producteurs, cultures et superficies"
      icon={Sprout}
    />
  );
}
