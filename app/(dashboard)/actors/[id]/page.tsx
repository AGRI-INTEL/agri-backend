'use client';

import { use } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ActorDetailView } from '@/components/actors/actor-detail-view';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useActor } from '@/hooks/use-actors';

export default function ActorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: actor, isLoading } = useActor(id);

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
        <EmptyState icon="👤" title="Acteur introuvable" description="Cet acteur n'existe pas ou a été supprimé." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <ActorDetailView actor={actor} />
    </PageWrapper>
  );
}
