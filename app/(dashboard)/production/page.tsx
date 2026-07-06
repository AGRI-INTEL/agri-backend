'use client';
import { Sprout } from 'lucide-react';
import { SectorDashboard } from '@/components/actors/sector-dashboard';

export default function ProductionPage() {
  return (
    <SectorDashboard
      sector="vegetal"
      title="Secteur Végétal"
      description="Producteurs, cultures et superficies agricoles"
      icon={Sprout}
      color="#16A34A"
      backgroundImage="/images/sectors/vegetal.webp"
    />
  );
}
