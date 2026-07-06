'use client';

import { usePathname } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ActorDetailView } from '@/components/actors/actor-detail-view';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useActor } from '@/hooks/use-actors';
import type { ActorRow } from '@/components/actors/actor-card';
import { UserX } from 'lucide-react';

export default function ActorDetailClient(_: { params: Promise<{ id: string }> }) {
  // In static export, params always contains the build-time value ('_').
  // Read the real UUID from the URL instead.
  const pathname = usePathname();
  const id = pathname?.split('/actors/')?.[1]?.split('/')?.[0] ?? '_';

  const { data: rawActor, isLoading } = useActor(id === '_' ? '' : id);
  const actor = rawActor ? (rawActor as unknown as ActorRow) : undefined;

  if (!id || id === '_') {
    return (
      <PageWrapper>
        <EmptyState icon={UserX} title="Acteur introuvable" description="Identifiant d'acteur invalide." />
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <LoadingSkeleton variant="card" count={2} />
      </PageWrapper>
    );
  }

  if (!actor) {
    return (
      <PageWrapper>
        <EmptyState icon={UserX} title="Acteur introuvable" description="Cet acteur n'existe pas ou a été supprimé." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <ActorDetailView actor={actor} />
    </PageWrapper>
  );
}
