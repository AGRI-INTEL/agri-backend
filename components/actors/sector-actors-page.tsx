'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ActorCard, type ActorRow } from '@/components/actors/actor-card';
import { ActorFiltersBar } from '@/components/actors/actor-filters';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useActors } from '@/hooks/use-actors';
import type { SectorKey } from '@/lib/utils';

interface SectorActorsPageProps {
  sector: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

export function SectorActorsPage({ sector, title, description, icon: Icon }: SectorActorsPageProps) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [country, setCountry] = useState('all');
  const [status, setStatus] = useState('all');

  const { data, isLoading } = useActors({
    search: search || undefined,
    sector,
    role: role !== 'all' ? role : undefined,
    country: country !== 'all' ? country : undefined,
    status: status !== 'all' ? status : undefined,
    per_page: 100,
  });

  const actors = (data?.data ?? []) as unknown as ActorRow[];

  return (
    <PageWrapper
      title={title}
      description={description}
      actions={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      }
    >
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Icon className="h-6 w-6" />
        <span className="text-sm font-medium">{data?.total ?? 0} acteurs</span>
      </div>

      <ActorFiltersBar
        search={search}
        onSearchChange={setSearch}
        sector={sector}
        onSectorChange={() => {}}
        role={role}
        onRoleChange={setRole}
        country={country}
        onCountryChange={setCountry}
        status={status}
        onStatusChange={setStatus}
        onReset={() => { setSearch(''); setRole('all'); setCountry('all'); setStatus('all'); }}
      />

      <div className="mt-6">
        {isLoading ? (
          <LoadingSkeleton variant="card" count={8} />
        ) : actors.length === 0 ? (
          <EmptyState icon="🌾" title="Aucun acteur" description="Aucun acteur trouvé dans ce secteur." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {actors.map((a) => <ActorCard key={a.id} row={a} />)}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
