'use client';

import { Beef } from 'lucide-react';
import { SectorActorsPage } from '@/components/actors/sector-actors-page';

export default function AnimalPage() {
  return (
    <SectorActorsPage sector="animal" title="Secteur Animal" description="Éleveurs et cheptel" icon={Beef} />
  );
}
