'use client';

import Link from 'next/link';
import { Eye, MapPin, Star, Mail, Phone, BadgeCheck, Shield, Medal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { getSectorColor, getSectorEmoji, formatNumber } from '@/lib/utils';
import type { SectorKey } from '@/lib/utils';

export interface ActorRow {
  id: string;
  name: string;
  sector: string;
  role: string;
  country: string;
  country_name: string;
  region: string;
  city: string;
  phone?: string;
  email?: string;
  organisation?: string;
  organisation_type?: string;
  tags: string[];
  status: string;
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  is_premium: boolean;
  view_count: number;
  contact_count: number;
  rating_average: number;
  rating_count: number;
  description?: string;
  vegetal_data?: { total_area_ha: number; main_crop?: string; annual_revenue?: number };
  animal_data?: { total_livestock: number; main_species?: string; annual_revenue?: number };
  halieutique_data?: { pirogues_count: number; main_species?: string[]; motor: boolean };
  forestier_data?: { forest_area_ha: number; main_products?: string[] };
  minier_data?: { minerals?: string[]; workers_count?: number };
  industriel_data?: { products?: string[]; employee_count?: number };
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/30',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/30',
    pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30',
    verified: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/30',
  };
  const labels: Record<string, string> = {
    active: 'Actif', inactive: 'Inactif', pending: 'En attente', verified: 'Vérifié',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors[status] || colors.inactive}`}>
      {status === 'verified' && <BadgeCheck className="h-3 w-3" />}
      {labels[status] || status}
    </span>
  );
}

export function ActorCard({ row }: { row: ActorRow }) {
  const sectorKey = row.sector as SectorKey;
  const sectorColor = getSectorColor(sectorKey);
  const sectorEmoji = getSectorEmoji(sectorKey);

  const metric =
    row.vegetal_data ? `${formatNumber(row.vegetal_data.total_area_ha)} ha` :
    row.animal_data ? `${formatNumber(row.animal_data.total_livestock)} têtes` :
    row.halieutique_data ? `${row.halieutique_data.pirogues_count} pirogues` :
    row.forestier_data ? `${formatNumber(row.forestier_data.forest_area_ha)} ha` :
    row.minier_data ? `${row.minier_data.workers_count ?? '-'} ouvriers` :
    row.industriel_data ? `${row.industriel_data.employee_count ?? '-'} employés` :
    null;

  return (
    <Card className="group relative overflow-hidden border-border/40 transition-all duration-200 hover:shadow-md hover:border-border/80">
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: sectorColor }} />
      </div>
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: sectorColor }} />

      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold text-primary">
            {(row.name || '?').split(' ').map((n: string) => n[0] || '').join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm truncate">{row.name}</h3>
              {row.is_featured && <Medal className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
              {row.is_premium && <Shield className="h-3.5 w-3.5 text-purple-500 shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground capitalize truncate">{row.role?.replace(/_/g, ' ')}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground truncate">{row.city}, {row.country_name}</span>
            </div>
          </div>
          <span className="text-lg shrink-0" title={row.sector}>{sectorEmoji}</span>
        </div>

        {/* Status + Organisation */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={row.status} />
          {row.organisation && (
            <Badge variant="secondary" className="text-[10px] max-w-28 truncate">
              {row.organisation}
            </Badge>
          )}
        </div>

        {/* Metric */}
        {metric && (
          <div className="rounded-lg bg-muted/50 px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capacité</p>
            <p className="text-sm font-bold font-mono">{metric}</p>
          </div>
        )}

        {/* Tags */}
        {row.tags && row.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {row.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 font-normal">{t}</Badge>
            ))}
          </div>
        )}

        {/* Contact */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {row.email && (
            <span className="flex items-center gap-1 truncate max-w-28">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{row.email}</span>
            </span>
          )}
          {row.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{row.phone}</span>
            </span>
          )}
        </div>

        {/* Rating + Views */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" />
            {row.rating_average?.toFixed(1) ?? '-'} ({row.rating_count ?? 0})
          </span>
          <span>{formatNumber(row.view_count)} vues</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="default" size="sm" className="flex-1 h-8 text-xs gap-1" asChild>
            <Link href={`/actors?id=${row.id}`}>
              <Eye className="h-3 w-3" />
              Profil
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
