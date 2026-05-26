'use client';

import { useState } from 'react';
import { Plus, Grid, List } from 'lucide-react';
import { ActorFormDialog } from '@/components/actors/actor-form-dialog';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ActorCard } from '@/components/actors/actor-card';
import { ActorFiltersBar } from '@/components/actors/actor-filters';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useActors } from '@/hooks/use-actors';
import type { ActorFilters } from '@/types/actor';

export default function ActorsPage() {
  const [filters, setFilters] = useState<ActorFilters>({ page: 1, limit: 24 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useActors(filters);
  const actors = data?.data || [];

  return (
    <PageWrapper
      title="Acteurs Agricoles"
      description={data ? `${data.total} acteurs enregistrés` : undefined}
      actions={
        <div className="flex gap-2">
          <div className="flex border border-border rounded-button overflow-hidden">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon-sm" onClick={() => setViewMode('grid')} aria-label="Grille">
              <Grid className="h-3.5 w-3.5" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon-sm" onClick={() => setViewMode('list')} aria-label="Liste">
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Ajouter un acteur
          </Button>
        </div>
      }
    >
      <ActorFiltersBar filters={filters} onChange={setFilters} />

      <div className="mt-6">
        {isLoading ? (
          <LoadingSkeleton variant="card" count={8} />
        ) : actors.length === 0 ? (
          <EmptyState icon="👥" title="Aucun acteur trouvé" description="Essayez d'autres filtres ou ajoutez un nouvel acteur." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {actors.map((a) => <ActorCard key={a.id} actor={a} />)}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={!data.has_prev}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
          >
            ← Précédent
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">
            Page {data.page} / {data.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!data.has_next}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
          >
            Suivant →
          </Button>
        </div>
      )}

      <ActorFormDialog open={showCreate} onOpenChange={setShowCreate} />
    </PageWrapper>
  );
}
