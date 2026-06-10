'use client';

import { RefreshCw, Download } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { PredictionPanel } from '@/components/predictions/prediction-panel';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export default function PredictionsPage() {
  const qc = useQueryClient();

  return (
    <PageWrapper
      title="Prédictions IA"
      description="Rendements, prix des denrées, tendances météo, production et risques maladies par intelligence artificielle"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => qc.invalidateQueries({ queryKey: ['predictions'] })}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Tout exporter</span>
          </Button>
        </div>
      }
    >
      <PredictionPanel />
    </PageWrapper>
  );
}
