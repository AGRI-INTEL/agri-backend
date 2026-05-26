'use client';

import { SearchBar } from '@/components/shared/search-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IndicatorFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  indicator: string;
  onIndicatorChange: (v: string) => void;
  country: string;
  onCountryChange: (v: string) => void;
}

const INDICATOR_OPTIONS = [
  { value: 'all', label: 'Tous les indicateurs' },
  { value: 'agricultural_gdp', label: 'PIB agricole' },
  { value: 'gdp', label: 'PIB' },
  { value: 'inflation', label: 'Inflation' },
  { value: 'employment', label: 'Emploi' },
  { value: 'export', label: 'Exportations' },
  { value: 'import', label: 'Importations' },
];

export function IndicatorFiltersBar({
  search,
  onSearchChange,
  indicator,
  onIndicatorChange,
  country,
  onCountryChange,
}: IndicatorFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <SearchBar value={search} onChange={onSearchChange} placeholder="Rechercher un pays..." className="flex-1 min-w-48" />
      <Select value={indicator} onValueChange={onIndicatorChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Indicateur" />
        </SelectTrigger>
        <SelectContent>
          {INDICATOR_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={country || 'all'} onValueChange={onCountryChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Pays" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les pays</SelectItem>
          <SelectItem value="Sénégal">Sénégal</SelectItem>
          <SelectItem value="Ghana">Ghana</SelectItem>
          <SelectItem value="Nigeria">Nigeria</SelectItem>
          <SelectItem value="Togo">Togo</SelectItem>
          <SelectItem value="Côte">Côte d&apos;Ivoire</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
