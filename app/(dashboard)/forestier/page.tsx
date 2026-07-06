'use client';
import { TreePine } from 'lucide-react';
import { SectorDashboard } from '@/components/actors/sector-dashboard';

export default function ForestierPage() {
  return (
    <SectorDashboard
      sector="forestier"
      title="Secteur Forestier"
      description="Exploitants forestiers, concessions et produits forestiers"
      icon={TreePine}
      color="#92400E"
      backgroundImage="/images/sectors/forestier.webp"
    />
  );
}
