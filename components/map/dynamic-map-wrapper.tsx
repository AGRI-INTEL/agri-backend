'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-muted/50',
        className
      )}
      aria-label="Chargement de la carte..."
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-foreground">Chargement de la carte...</p>
        <p className="text-xs text-muted-foreground">OpenStreetMap</p>
      </div>
    </div>
  );
}

export const DynamicMap = dynamic(
  () => import('./interactive-map').then((mod) => ({ default: mod.InteractiveMap })),
  {
    ssr: false,
    loading: () => <MapSkeleton className="w-full h-full" />,
  }
);