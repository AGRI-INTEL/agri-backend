'use client';

import { Fish } from 'lucide-react';
import { SectorActorsPage } from '@/components/actors/sector-actors-page';

export default function HalieutiquePage() {
  return (
    <SectorActorsPage sector="halieutique" title="Secteur Halieutique" description="Pêcheurs et aquaculture" icon={Fish} />
  );
}
