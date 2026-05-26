'use client';

import { TreePine } from 'lucide-react';
import { SectorActorsPage } from '@/components/actors/sector-actors-page';

export default function ForestierPage() {
  return (
    <SectorActorsPage sector="forestier" title="Secteur Forestier" description="Exploitants et gestion durable" icon={TreePine} />
  );
}
