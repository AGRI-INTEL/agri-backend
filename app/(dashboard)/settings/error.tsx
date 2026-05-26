'use client';

import { ErrorFallback } from '@/components/ui/error-fallback';

export default function SettingsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      description="Impossible d'afficher les paramètres pour le moment. Réessayez ou retournez à l'accueil." 
    />
  );
}
