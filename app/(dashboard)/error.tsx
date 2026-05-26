'use client';

import { ErrorFallback } from '@/components/ui/error-fallback';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      description="Impossible d'afficher le tableau de bord pour le moment. Réessayez ou revenez à l'accueil." 
    />
  );
}
