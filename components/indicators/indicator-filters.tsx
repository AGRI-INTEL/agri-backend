'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface IndicatorFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  indicator: string;
  onIndicatorChange: (v: string) => void;
  country: string;
  onCountryChange: (v: string) => void;
  sector?: string;
  onSectorChange?: (v: string) => void;
  health?: string;
  onHealthChange?: (v: string) => void;
  onReset?: () => void;
}

// ─── Options ─────────────────────────────────────────────────────────────────

const INDICATOR_OPTIONS = [
  { value: 'all', label: 'Tous les indicateurs' },
  { value: 'rendement', label: 'Rendement' },
  { value: 'prix', label: 'Prix' },
  { value: 'production', label: 'Production' },
  { value: 'marché', label: 'Marché' },
  { value: 'emploi', label: 'Emploi' },
  { value: 'climat', label: 'Climat' },
  { value: 'environnement', label: 'Environnement' },
];

const SECTOR_OPTIONS = [
  { value: 'all', label: 'Tous secteurs' },
  { value: 'vegetal', label: 'Végétal' },
  { value: 'animal', label: 'Animal' },
  { value: 'halieutique', label: 'Halieutique' },
  { value: 'forestier', label: 'Forestier' },
];

const COUNTRY_OPTIONS = [
  { value: 'all', label: 'Tous pays' },
  { value: 'Sénégal', label: 'Sénégal' },
  { value: 'Mali', label: 'Mali' },
  { value: "Côte d'Ivoire", label: "Côte d'Ivoire" },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Burkina Faso', label: 'Burkina Faso' },
  { value: 'Togo', label: 'Togo' },
  { value: 'Bénin', label: 'Bénin' },
];

const HEALTH_OPTIONS = [
  { value: 'all', label: 'Tous états' },
  { value: 'optimal', label: 'Optimal' },
  { value: 'alert', label: 'Surveillance' },
  { value: 'critical', label: 'Critique' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function IndicatorFiltersBar({
  search, onSearchChange,
  indicator, onIndicatorChange,
  country, onCountryChange,
  sector = 'all', onSectorChange,
  health = 'all', onHealthChange,
  onReset,
}: IndicatorFiltersProps) {
  const hasActiveFilters = indicator !== 'all' || country !== 'all' || sector !== 'all' || health !== 'all';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un indicateur..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-8 pr-8 text-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <Select value={indicator} onValueChange={onIndicatorChange}>
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INDICATOR_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sector filter */}
        {onSectorChange && (
          <Select value={sector} onValueChange={onSectorChange}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTOR_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Country filter */}
        <Select value={country} onValueChange={onCountryChange}>
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Health filter */}
        {onHealthChange && (
          <Select value={health} onValueChange={onHealthChange}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HEALTH_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Reset */}
        {hasActiveFilters && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-9 text-xs gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">Filtres actifs:</span>
          {indicator !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
              {INDICATOR_OPTIONS.find((o) => o.value === indicator)?.label || indicator}
            </span>
          )}
          {sector !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {SECTOR_OPTIONS.find((o) => o.value === sector)?.label || sector}
            </span>
          )}
          {country !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {COUNTRY_OPTIONS.find((o) => o.value === country)?.label || country}
            </span>
          )}
          {health !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {HEALTH_OPTIONS.find((o) => o.value === health)?.label || health}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
