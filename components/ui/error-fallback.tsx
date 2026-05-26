'use client';

import { ArrowRight, AlertTriangle, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
  description: string;
  children?: ReactNode;
}

export function ErrorFallback({ error, reset, description, children }: ErrorFallbackProps) {
  const router = useRouter();

  useEffect(() => {
    if (!error) {
      return;
    }

    if (typeof window !== 'undefined') {
      const sentry = (window as Window & { Sentry?: { captureException: (e: Error, options: unknown) => void } }).Sentry;
      if (sentry?.captureException) {
        sentry.captureException(error, {
          level: 'error',
          extra: {
            description,
          },
        });
      }
    }

    console.error('[ErrorBoundary] ', error);
  }, [error, description]);

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card/95 p-8 shadow-2xl shadow-black/10 backdrop-blur-xl">
        <div className="flex items-center gap-4 text-secondary">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary/10 text-secondary shadow-sm shadow-secondary/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Erreur inattendue</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Quelque chose s&apos;est mal passé</h1>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
          <p>{description}</p>
          <p>
            Si le problème persiste, essayez de recharger la page ou revenez à l&apos;écran d&apos;accueil.
          </p>
          {children}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowRight className="h-4 w-4" />
            Recharger
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Home className="h-4 w-4" />
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </div>
  );
}
