'use client';

import { ErrorFallback } from '@/components/ui/error-fallback';

export default function AuthError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      description="Une erreur est survenue pendant l'authentification. Réessayez ou retournez à l'accueil." 
    />
  );
}
