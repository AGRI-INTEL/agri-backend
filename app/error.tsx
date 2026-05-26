'use client';

import { ErrorFallback } from '@/components/ui/error-fallback';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      description="Une erreur critique a interrompu le chargement de l'application. Réessayez ou revenez à l'accueil."
    />
  );
}
