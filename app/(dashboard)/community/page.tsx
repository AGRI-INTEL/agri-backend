'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupCard } from '@/components/community/group-card';
import { SearchBar } from '@/components/shared/search-bar';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGroups } from '@/hooks/use-community';
import { useDebounce } from '@/hooks/use-debounce';

export default function CommunityPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGroups({
    search: debouncedSearch || undefined,
    type: type !== 'all' ? type : undefined,
  });

  const groups = data?.data || [];

  return (
    <PageWrapper
      title="Communautés Agricoles"
      description="Rejoignez des groupes d'agriculteurs et partagez vos connaissances"
      actions={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Créer un groupe
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un groupe..." className="flex-1 min-w-48" />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="prive">Privé</SelectItem>
            <SelectItem value="professionnel">Professionnel</SelectItem>
            <SelectItem value="institutionnel">Institutionnel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={6} />
      ) : groups.length === 0 ? (
        <EmptyState icon="👥" title="Aucun groupe trouvé" description="Essayez d'autres filtres ou créez votre propre groupe." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groups.map((g) => <GroupCard key={g.id} group={g} />)}
        </div>
      )}
    </PageWrapper>
  );
}
