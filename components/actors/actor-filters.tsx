'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelector } from '@/components/shared/country-selector';
import { SearchBar } from '@/components/shared/search-bar';
import { SECTORS } from '@/lib/constants';
import { SECTOR_LABELS } from '@/lib/utils';
import type { ActorFilters } from '@/types/actor';

interface ActorFiltersProps {
  filters: ActorFilters;
  onChange: (filters: ActorFilters) => void;
}

export function ActorFiltersBar({ filters, onChange }: ActorFiltersProps) {
  const update = (key: keyof ActorFilters, value: string | undefined) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  return (
    <div className="flex flex-wrap gap-3">
      <SearchBar
        value={filters.search || ''}
        onChange={(v) => update('search', v)}
        placeholder="Rechercher un acteur..."
        className="flex-1 min-w-48"
      />
      <Select value={filters.sector || 'all'} onValueChange={(v) => update('sector', v === 'all' ? undefined : v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sous-secteur" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les secteurs</SelectItem>
          {SECTORS.map((s) => (
            <SelectItem key={s} value={s}>{SECTOR_LABELS[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <CountrySelector
        value={filters.country}
        onChange={(v) => update('country', v)}
        includeAll
      />
    </div>
  );
}
