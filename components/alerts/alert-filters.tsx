'use client';

import { SearchBar } from '@/components/shared/search-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AlertFilters, AlertSeverity, AlertType } from '@/types/alert';

interface AlertFiltersBarProps {
  filters: AlertFilters;
  onChange: (f: AlertFilters) => void;
}

export function AlertFiltersBar({ filters, onChange }: AlertFiltersBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <SearchBar
        value={filters.search || ''}
        onChange={(search) => onChange({ ...filters, search })}
        placeholder="Rechercher une alerte..."
        className="flex-1 min-w-48"
      />
      <Select
        value={filters.severity || 'all'}
        onValueChange={(v) => onChange({ ...filters, severity: v === 'all' ? undefined : v as AlertSeverity })}
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Sévérité" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes</SelectItem>
          <SelectItem value="info">Info</SelectItem>
          <SelectItem value="warning">Attention</SelectItem>
          <SelectItem value="critical">Critique</SelectItem>
          <SelectItem value="emergency">Urgence</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.type || 'all'}
        onValueChange={(v) => onChange({ ...filters, type: v === 'all' ? undefined : v as AlertType })}
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous types</SelectItem>
          <SelectItem value="meteo">Météo</SelectItem>
          <SelectItem value="prix">Prix</SelectItem>
          <SelectItem value="secheresse">Sécheresse</SelectItem>
          <SelectItem value="ravageur">Ravageur</SelectItem>
          <SelectItem value="marche">Marché</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.is_read === undefined ? 'all' : filters.is_read ? 'read' : 'unread'}
        onValueChange={(v) =>
          onChange({
            ...filters,
            is_read: v === 'all' ? undefined : v === 'read',
          })
        }
      >
        <SelectTrigger className="w-32"><SelectValue placeholder="Statut" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes</SelectItem>
          <SelectItem value="unread">Non lues</SelectItem>
          <SelectItem value="read">Lues</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
