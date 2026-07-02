'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: 'url(/fond-landscape.jpg)' }}
      />
      <div className="relative z-10 mx-auto max-w-lg px-6 text-center">
        <h1 className="text-[12rem] font-bold leading-none tracking-tighter text-secondary">
          404
        </h1>
        <h2 className="mb-4 mt-2 text-3xl font-semibold text-foreground">
          Page non trouvée
        </h2>
        <p className="mb-10 text-lg text-muted-foreground">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-secondary px-8 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Retourner au tableau de bord
        </Link>
      </div>
    </div>
  );
}
