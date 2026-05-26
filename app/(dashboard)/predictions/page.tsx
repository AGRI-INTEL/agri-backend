'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { PredictionPanel } from '@/components/predictions/prediction-panel';

export default function PredictionsPage() {
  return (
    <PageWrapper
      title="Prédictions IA"
      description="Rendements, prix des denrées et tendances météo par intelligence artificielle"
    >
      <PredictionPanel />
    </PageWrapper>
  );
}
