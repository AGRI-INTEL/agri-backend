'use client';

import { ErrorFallback } from '@/components/ui/error-fallback';

export default function LandingError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      description="Nous n'avons pas pu charger la page. Réessayez ou contactez l'équipe si le problème persiste." 
    />
  );
}
