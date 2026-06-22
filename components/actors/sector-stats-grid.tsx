'use client';

import { useMemo } from 'react';
import {
  Sprout,
  Beef,
  Fish,
  TreePine,
  Users,
  Maximize2,
  Droplets,
  Wheat,
  HeartPulse,
  Anchor,
  Zap,
  Layers,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ActorRow } from '@/components/actors/actor-card';
import { formatNumber } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface StatCard {
  label: string;
  value: string;
  subLabel?: string;
  icon: React.ElementType;
  trend?: string;
}

interface SectorStatsGridProps {
  sector: string;
  actors: ActorRow[];
  color?: string;
}

// ============================================================================
// VEGETAL STATS
// ============================================================================

function computeVegetalStats(actors: ActorRow[]): StatCard[] {
  const withData = actors.filter((a) => a.vegetal_data);
  const totalActors = actors.length;

  const superficieTotale = withData.reduce(
    (sum, a) => sum + (a.vegetal_data?.total_area_ha ?? 0),
    0
  );

  const avecIrrigation = actors.filter((a) => {
    const d = a.vegetal_data as (typeof actors[0]['vegetal_data'] & { has_irrigation?: boolean }) | undefined;
    return d?.has_irrigation === true;
  }).length;

  const irrigationPct =
    totalActors > 0 ? Math.round((avecIrrigation / totalActors) * 100) : 0;

  const cultures = new Set<string>();
  withData.forEach((a) => {
    if (a.vegetal_data?.main_crop) cultures.add(a.vegetal_data.main_crop);
  });

  return [
    {
      label: 'Total acteurs',
      value: formatNumber(totalActors),
      subLabel: 'enregistrés',
      icon: Users,
      trend: '+0%',
    },
    {
      label: 'Superficie totale',
      value: `${formatNumber(Math.round(superficieTotale))} ha`,
      subLabel: 'cultivée',
      icon: Maximize2,
      trend: '+0%',
    },
    {
      label: 'Avec irrigation',
      value: `${irrigationPct}%`,
      subLabel: `${avecIrrigation} acteurs`,
      icon: Droplets,
      trend: '+0%',
    },
    {
      label: 'Cultures uniques',
      value: formatNumber(cultures.size),
      subLabel: 'diversité',
      icon: Wheat,
      trend: '+0%',
    },
  ];
}

// ============================================================================
// ANIMAL STATS
// ============================================================================

function computeAnimalStats(actors: ActorRow[]): StatCard[] {
  const withData = actors.filter((a) => a.animal_data);
  const totalActors = actors.length;

  const cheptelTotal = withData.reduce(
    (sum, a) => sum + (a.animal_data?.total_livestock ?? 0),
    0
  );

  // Count bovins from full actor data — ActorRow.animal_data only has total_livestock
  // We sum total_livestock as a proxy since ActorRow doesn't expose species breakdown
  const bovinsTotal = withData.reduce((sum, a) => {
    const d = a.animal_data as (typeof actors[0]['animal_data'] & {
      bovins?: number;
      species?: { species: string; count: number }[];
    }) | undefined;
    if (d?.bovins !== undefined) return sum + d.bovins;
    if (Array.isArray(d?.species)) {
      const bovin = d.species.find(
        (s) => s.species.toLowerCase().includes('bovin') || s.species.toLowerCase().includes('boeuf')
      );
      return sum + (bovin?.count ?? 0);
    }
    return sum;
  }, 0);

  const avecVeto = actors.filter((a) => {
    const d = a.animal_data as (typeof actors[0]['animal_data'] & {
      veterinarian?: string;
      vaccination_program?: boolean;
    }) | undefined;
    return d?.veterinarian != null || d?.vaccination_program === true;
  }).length;

  const vetoPct =
    totalActors > 0 ? Math.round((avecVeto / totalActors) * 100) : 0;

  return [
    {
      label: 'Total acteurs',
      value: formatNumber(totalActors),
      subLabel: 'éleveurs',
      icon: Users,
      trend: '+0%',
    },
    {
      label: 'Cheptel total',
      value: formatNumber(cheptelTotal),
      subLabel: 'têtes',
      icon: Beef,
      trend: '+0%',
    },
    {
      label: 'Bovins',
      value: bovinsTotal > 0 ? formatNumber(bovinsTotal) : '—',
      subLabel: 'total bovins',
      icon: Sprout,
      trend: '+0%',
    },
    {
      label: 'Avec vétérinaire',
      value: `${vetoPct}%`,
      subLabel: `${avecVeto} acteurs`,
      icon: HeartPulse,
      trend: '+0%',
    },
  ];
}

// ============================================================================
// HALIEUTIQUE STATS
// ============================================================================

function computeHalieutiqueStats(actors: ActorRow[]): StatCard[] {
  const withData = actors.filter((a) => a.halieutique_data);
  const totalActors = actors.length;

  const piroguesTotal = withData.reduce(
    (sum, a) => sum + (a.halieutique_data?.pirogues_count ?? 0),
    0
  );

  const motorisees = withData.filter((a) => a.halieutique_data?.motor === true).length;
  const motoriseePct =
    withData.length > 0 ? Math.round((motorisees / withData.length) * 100) : 0;

  const captureTotal = withData.reduce((sum, a) => {
    const d = a.halieutique_data as (typeof actors[0]['halieutique_data'] & {
      annual_catch_tonnes?: number;
    }) | undefined;
    return sum + (d?.annual_catch_tonnes ?? 0);
  }, 0);

  return [
    {
      label: 'Total acteurs',
      value: formatNumber(totalActors),
      subLabel: 'pêcheurs',
      icon: Users,
      trend: '+0%',
    },
    {
      label: 'Pirogues',
      value: formatNumber(piroguesTotal),
      subLabel: 'total flotte',
      icon: Anchor,
      trend: '+0%',
    },
    {
      label: 'Motorisées',
      value: `${motoriseePct}%`,
      subLabel: `${motorisees} pirogues`,
      icon: Zap,
      trend: '+0%',
    },
    {
      label: 'Capture estimée',
      value: captureTotal > 0 ? `${formatNumber(Math.round(captureTotal))} t` : '—',
      subLabel: 'annuelle',
      icon: Fish,
      trend: '+0%',
    },
  ];
}

// ============================================================================
// FORESTIER STATS
// ============================================================================

function computeForestierStats(actors: ActorRow[]): StatCard[] {
  const withData = actors.filter((a) => a.forestier_data);
  const totalActors = actors.length;

  const superficieConcessions = withData.reduce(
    (sum, a) => sum + (a.forestier_data?.forest_area_ha ?? 0),
    0
  );

  const certifiesDurables = withData.filter((a) => {
    const d = a.forestier_data as (typeof actors[0]['forestier_data'] & {
      fsc_certified?: boolean;
      pefc_certified?: boolean;
    }) | undefined;
    return d?.fsc_certified === true || d?.pefc_certified === true;
  }).length;

  const certifiesPct =
    withData.length > 0 ? Math.round((certifiesDurables / withData.length) * 100) : 0;

  const produits = new Set<string>();
  withData.forEach((a) => {
    const d = a.forestier_data as (typeof actors[0]['forestier_data'] & {
      main_products?: string[];
    }) | undefined;
    (d?.main_products ?? []).forEach((p) => produits.add(p));
  });

  return [
    {
      label: 'Total acteurs',
      value: formatNumber(totalActors),
      subLabel: 'exploitants',
      icon: Users,
      trend: '+0%',
    },
    {
      label: 'Sup. concessions',
      value: `${formatNumber(Math.round(superficieConcessions))} ha`,
      subLabel: 'total',
      icon: TreePine,
      trend: '+0%',
    },
    {
      label: 'Certifiés durables',
      value: `${certifiesPct}%`,
      subLabel: `${certifiesDurables} acteurs`,
      icon: BadgeCheck,
      trend: '+0%',
    },
    {
      label: 'Produits uniques',
      value: formatNumber(produits.size),
      subLabel: 'diversité',
      icon: Layers,
      trend: '+0%',
    },
  ];
}

// ============================================================================
// FALLBACK STATS (for unrecognised sectors)
// ============================================================================

function computeFallbackStats(actors: ActorRow[]): StatCard[] {
  const active = actors.filter((a) => a.is_active).length;
  const verified = actors.filter((a) => a.is_verified).length;
  const activePct =
    actors.length > 0 ? Math.round((active / actors.length) * 100) : 0;
  const verifiedPct =
    actors.length > 0 ? Math.round((verified / actors.length) * 100) : 0;

  return [
    {
      label: 'Total acteurs',
      value: formatNumber(actors.length),
      subLabel: 'enregistrés',
      icon: Users,
      trend: '+0%',
    },
    {
      label: 'Actifs',
      value: formatNumber(active),
      subLabel: `${activePct}%`,
      icon: TrendingUp,
      trend: '+0%',
    },
    {
      label: 'Vérifiés',
      value: formatNumber(verified),
      subLabel: `${verifiedPct}%`,
      icon: BadgeCheck,
      trend: '+0%',
    },
    {
      label: 'Premium',
      value: formatNumber(actors.filter((a) => a.is_premium).length),
      subLabel: 'membres premium',
      icon: Layers,
      trend: '+0%',
    },
  ];
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  stat: StatCard;
  borderColor: string;
}

function StatCardItem({ stat, borderColor }: StatCardProps) {
  const Icon = stat.icon;

  return (
    <Card
      className="relative overflow-hidden border-border/40"
      style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold font-mono leading-tight truncate">
              {stat.value}
            </p>
            {stat.subLabel && (
              <p className="mt-0.5 text-xs text-muted-foreground truncate">{stat.subLabel}</p>
            )}
          </div>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${borderColor}18` }}
          >
            <Icon className="h-4 w-4" style={{ color: borderColor }} />
          </div>
        </div>

        {stat.trend && (
          <div className="mt-3 flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <TrendingUp className="h-2.5 w-2.5" />
              {stat.trend}
            </span>
            <span className="text-[10px] text-muted-foreground">ce mois</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SectorStatsGrid({ sector, actors, color = '#16A34A' }: SectorStatsGridProps) {
  const stats = useMemo<StatCard[]>(() => {
    switch (sector) {
      case 'vegetal':
        return computeVegetalStats(actors);
      case 'animal':
        return computeAnimalStats(actors);
      case 'halieutique':
        return computeHalieutiqueStats(actors);
      case 'forestier':
        return computeForestierStats(actors);
      default:
        return computeFallbackStats(actors);
    }
  }, [sector, actors]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <StatCardItem key={idx} stat={stat} borderColor={color} />
      ))}
    </div>
  );
}
