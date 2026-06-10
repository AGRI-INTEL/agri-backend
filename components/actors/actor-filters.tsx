'use client';

import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSectorLabel } from '@/lib/utils';

const SECTORS = ['vegetal', 'animal', 'halieutique', 'forestier', 'minier', 'industriel'] as const;
const ROLES = [
  { value: 'producteur', label: 'Producteur' },
  { value: 'eleveur', label: 'Éleveur' },
  { value: 'pecheur', label: 'Pêcheur' },
  { value: 'exploitant_forestier', label: 'Exploitant forestier' },
  { value: 'cooperative', label: 'Coopérative' },
  { value: 'groupement', label: 'Groupement' },
  { value: 'transformateur', label: 'Transformateur' },
  { value: 'commercant', label: 'Commerçant' },
  { value: 'exportateur', label: 'Exportateur' },
  { value: 'agronome', label: 'Agronome' },
  { value: 'ong', label: 'ONG / Institution' },
  { value: 'financier', label: 'Financier / Assureur' },
  { value: 'autre', label: 'Autre' },
];
const COUNTRIES = [
  { code: 'SN', name: 'Sénégal' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'NE', name: 'Niger' },
  { code: 'BJ', name: 'Bénin' },
  { code: 'TG', name: 'Togo' },
  { code: 'GH', name: 'Ghana' },
  { code: 'NG', name: 'Nigéria' },
  { code: 'CM', name: 'Cameroun' },
];
const STATUSES = [
  { value: 'active', label: 'Actif', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inactif', color: 'bg-gray-500' },
  { value: 'pending', label: 'En attente', color: 'bg-amber-500' },
  { value: 'verified', label: 'Vérifié', color: 'bg-blue-500' },
];

interface ActorFiltersBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sector: string;
  onSectorChange: (v: string) => void;
  role: string;
  onRoleChange: (v: string) => void;
  country: string;
  onCountryChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  onReset: () => void;
}

export function ActorFiltersBar({
  search, onSearchChange,
  sector, onSectorChange,
  role, onRoleChange,
  country, onCountryChange,
  status, onStatusChange,
  onReset,
}: ActorFiltersBarProps) {
  const hasAny = search || sector !== 'all' || role !== 'all' || country !== 'all' || status !== 'all';

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (sector !== 'all') activeChips.push({ label: `Secteur: ${getSectorLabel(sector as 'vegetal')}`, onRemove: () => onSectorChange('all') });
  if (role !== 'all') activeChips.push({ label: `Rôle: ${ROLES.find((r) => r.value === role)?.label ?? role}`, onRemove: () => onRoleChange('all') });
  if (country !== 'all') activeChips.push({ label: `Pays: ${COUNTRIES.find((c) => c.code === country)?.name ?? country}`, onRemove: () => onCountryChange('all') });
  if (status !== 'all') activeChips.push({ label: `Statut: ${STATUSES.find((s) => s.value === status)?.label ?? status}`, onRemove: () => onStatusChange('all') });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Rechercher un acteur..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 min-w-48 h-9 text-sm"
        />

        <Select value={sector} onValueChange={onSectorChange}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Secteur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les secteurs</SelectItem>
            {SECTORS.map((s) => (
              <SelectItem key={s} value={s}>{getSectorLabel(s as 'vegetal')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={country} onValueChange={onCountryChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Pays" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les pays</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  {s.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasAny && (
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={onReset}>
            <X className="h-3 w-3 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map((chip, i) => (
            <Badge key={i} variant="secondary" className="gap-1 px-2 py-0.5 text-xs cursor-pointer" onClick={chip.onRemove}>
              {chip.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
