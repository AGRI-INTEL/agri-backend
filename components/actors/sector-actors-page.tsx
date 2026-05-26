'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ActorCard } from '@/components/actors/actor-card';
import { ActorFiltersBar } from '@/components/actors/actor-filters';
import { ActorFormDialog } from '@/components/actors/actor-form-dialog';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useActors } from '@/hooks/use-actors';
import type { ActorFilters, Sector } from '@/types/actor';

interface SectorActorsPageProps {
  sector: Sector;
  title: string;
  description: string;
  icon: React.ElementType;
}

export function SectorActorsPage({ sector, title, description, icon: Icon }: SectorActorsPageProps) {
  const [filters, setFilters] = useState<ActorFilters>({ page: 1, limit: 24, sector });
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useActors(filters);
  const actors = data?.data || [];

  return (
    <PageWrapper
      title={title}
      description={description}
      actions={
        <Button className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      }
    >
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Icon className="h-6 w-6" />
        <span className="text-sm font-medium">{data?.total ?? 0} acteurs</span>
      </div>

      <ActorFiltersBar filters={filters} onChange={(f) => setFilters({ ...f, sector })} />

      <div className="mt-6">
        {isLoading ? (
          <LoadingSkeleton variant="card" count={8} />
        ) : actors.length === 0 ? (
          <EmptyState icon="🌾" title="Aucun acteur" description="Ajoutez le premier acteur de ce secteur." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {actors.map((a) => <ActorCard key={a.id} actor={a} />)}
          </div>
        )}
      </div>

      <ActorFormDialog open={showCreate} onOpenChange={setShowCreate} defaultSector={sector} />
    </PageWrapper>
  );
}
