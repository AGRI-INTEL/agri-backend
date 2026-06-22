'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import type { ActorRow } from '@/components/actors/actor-card';

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_COLORS = [
  '#16A34A',
  '#D97706',
  '#0891B2',
  '#92400E',
  '#7C3AED',
  '#DC2626',
];

// ============================================================================
// TYPES
// ============================================================================

interface SectorChartsProps {
  sector: string;
  actors: ActorRow[];
  color: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

// ============================================================================
// SHARED HELPERS
// ============================================================================

/**
 * Count items by a string key, returning [{name, value}] sorted descending.
 */
function countBy(items: string[], topN = 10): ChartDataItem[] {
  const map: Record<string, number> = {};
  for (const item of items) {
    if (!item) continue;
    map[item] = (map[item] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

/**
 * A short label for the X-axis that keeps charts readable.
 */
function shortLabel(label: string, maxLen = 12): string {
  if (label.length <= maxLen) return label;
  return label.slice(0, maxLen - 1) + '…';
}

// ============================================================================
// SHARED SUB-COMPONENTS
// ============================================================================

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  minHeight?: number;
}

function ChartCard({ title, children, minHeight = 220 }: ChartCardProps) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
        <div style={{ minHeight }}>{children}</div>
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full min-h-[160px] items-center justify-center rounded-lg bg-muted/30">
      <p className="text-xs text-muted-foreground">Aucune donnée disponible</p>
    </div>
  );
}

interface SimpleBarChartProps {
  data: ChartDataItem[];
  dataKey?: string;
  color: string;
  height?: number;
}

function SimpleBarChart({ data, dataKey = 'value', color, height = 200 }: SimpleBarChartProps) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: 'currentColor' }}
          tickFormatter={(v: string) => shortLabel(v)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'currentColor' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface SimplePieChartProps {
  data: ChartDataItem[];
  height?: number;
}

function SimplePieChart({ data, height = 200 }: SimplePieChartProps) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(value: string) => shortLabel(value, 20)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// VEGETAL CHARTS
// ============================================================================

function VegetalCharts({ actors, color }: { actors: ActorRow[]; color: string }) {
  const withData = actors.filter((a) => a.vegetal_data);

  const cultureData = useMemo(() => {
    const crops = withData
      .map((a) => a.vegetal_data?.main_crop)
      .filter((c): c is string => Boolean(c));
    return countBy(crops, 8);
  }, [withData]);

  const regionData = useMemo(() => {
    const regions = actors.map((a) => a.region).filter(Boolean);
    return countBy(regions, 8);
  }, [actors]);

  const irrigationData = useMemo(() => {
    const avecIrrigation = withData.filter((a) => {
      const d = a.vegetal_data as (typeof actors[0]['vegetal_data'] & {
        has_irrigation?: boolean;
      }) | undefined;
      return d?.has_irrigation === true;
    }).length;
    const sansIrrigation = withData.length - avecIrrigation;
    if (withData.length === 0) return [];
    return [
      { name: 'Avec irrigation', value: avecIrrigation },
      { name: 'Sans irrigation', value: sansIrrigation },
    ];
  }, [withData]);

  return (
    <>
      <ChartCard title="Cultures principales">
        <SimpleBarChart data={cultureData} color={color} />
      </ChartCard>

      <ChartCard title="Acteurs par region">
        <SimpleBarChart data={regionData} color={CHART_COLORS[2]} />
      </ChartCard>

      <ChartCard title="Irrigation">
        <SimplePieChart data={irrigationData} />
      </ChartCard>

      <ChartCard title="Top cultures (detail)">
        {cultureData.length === 0 ? (
          <EmptyChart />
        ) : (
          <SimplePieChart data={cultureData.slice(0, 5)} />
        )}
      </ChartCard>
    </>
  );
}

// ============================================================================
// ANIMAL CHARTS
// ============================================================================

function AnimalCharts({ actors, color }: { actors: ActorRow[]; color: string }) {
  const withData = actors.filter((a) => a.animal_data);

  const cheptelData = useMemo(() => {
    let bovins = 0;
    let ovins = 0;
    let caprins = 0;
    let volailles = 0;
    let porcins = 0;

    withData.forEach((a) => {
      const d = a.animal_data as (typeof actors[0]['animal_data'] & {
        species?: { species: string; count: number }[];
        bovins?: number;
        ovins?: number;
        caprins?: number;
        volailles?: number;
        porcins?: number;
      }) | undefined;

      if (!d) return;

      // Try flat fields first
      if (d.bovins !== undefined) bovins += d.bovins;
      if (d.ovins !== undefined) ovins += d.ovins;
      if (d.caprins !== undefined) caprins += d.caprins;
      if (d.volailles !== undefined) volailles += d.volailles;
      if (d.porcins !== undefined) porcins += d.porcins;

      // Then try species array
      if (Array.isArray(d.species)) {
        d.species.forEach((sp) => {
          const name = sp.species.toLowerCase();
          if (name.includes('bovin') || name.includes('boeuf') || name.includes('vache'))
            bovins += sp.count;
          else if (name.includes('ovin') || name.includes('mouton') || name.includes('brebis'))
            ovins += sp.count;
          else if (name.includes('caprin') || name.includes('chevre') || name.includes('chèvre'))
            caprins += sp.count;
          else if (
            name.includes('volaille') ||
            name.includes('poulet') ||
            name.includes('poule') ||
            name.includes('canard')
          )
            volailles += sp.count;
          else if (name.includes('porcin') || name.includes('porc') || name.includes('cochon'))
            porcins += sp.count;
        });
      }
    });

    return [
      { name: 'Bovins', value: bovins },
      { name: 'Ovins', value: ovins },
      { name: 'Caprins', value: caprins },
      { name: 'Volailles', value: volailles },
      { name: 'Porcins', value: porcins },
    ].filter((d) => d.value > 0);
  }, [withData]);

  const regionData = useMemo(() => {
    const regions = actors.map((a) => a.region).filter(Boolean);
    return countBy(regions, 8);
  }, [actors]);

  const farmingTypeData = useMemo(() => {
    const types = withData
      .map((a) => {
        const d = a.animal_data as (typeof actors[0]['animal_data'] & {
          farming_type?: string;
        }) | undefined;
        return d?.farming_type;
      })
      .filter((t): t is string => Boolean(t));
    return countBy(types, 6);
  }, [withData]);

  return (
    <>
      <ChartCard title="Composition du cheptel">
        <SimplePieChart data={cheptelData} />
      </ChartCard>

      <ChartCard title="Eleveurs par region">
        <SimpleBarChart data={regionData} color={color} />
      </ChartCard>

      <ChartCard title="Type d'elevage">
        <SimpleBarChart data={farmingTypeData} color={CHART_COLORS[4]} />
      </ChartCard>

      <ChartCard title="Cheptel par type (detail)">
        {cheptelData.length === 0 ? (
          <EmptyChart />
        ) : (
          <SimpleBarChart data={cheptelData} color={CHART_COLORS[3]} />
        )}
      </ChartCard>
    </>
  );
}

// ============================================================================
// HALIEUTIQUE CHARTS
// ============================================================================

function HalieutiqueCharts({ actors, color }: { actors: ActorRow[]; color: string }) {
  const withData = actors.filter((a) => a.halieutique_data);

  const flotteData = useMemo(() => {
    const motorisee = withData.filter((a) => a.halieutique_data?.motor === true).length;
    const nonMotorisee = withData.filter((a) => a.halieutique_data?.motor === false).length;
    if (withData.length === 0) return [];
    return [
      { name: 'Motorisee', value: motorisee },
      { name: 'Non motorisee', value: nonMotorisee },
    ].filter((d) => d.value > 0);
  }, [withData]);

  const zoneData = useMemo(() => {
    const regions = actors.map((a) => a.region).filter(Boolean);
    return countBy(regions, 8);
  }, [actors]);

  const typePecheData = useMemo(() => {
    const roles = actors.map((a) => a.role).filter(Boolean);
    return countBy(roles, 6);
  }, [actors]);

  return (
    <>
      <ChartCard title="Flotte (motorisee vs non)">
        <SimplePieChart data={flotteData} />
      </ChartCard>

      <ChartCard title="Zones de peche par region">
        <SimpleBarChart data={zoneData} color={color} />
      </ChartCard>

      <ChartCard title="Types de peche">
        <SimpleBarChart data={typePecheData} color={CHART_COLORS[1]} />
      </ChartCard>

      <ChartCard title="Repartition par port/zone">
        {zoneData.length === 0 ? (
          <EmptyChart />
        ) : (
          <SimplePieChart data={zoneData.slice(0, 5)} />
        )}
      </ChartCard>
    </>
  );
}

// ============================================================================
// FORESTIER CHARTS
// ============================================================================

function ForestierCharts({ actors, color }: { actors: ActorRow[]; color: string }) {
  const withData = actors.filter((a) => a.forestier_data);

  const exploitationTypeData = useMemo(() => {
    const types: string[] = [];
    withData.forEach((a) => {
      const d = a.forestier_data as (typeof actors[0]['forestier_data'] & {
        exploitation_type?: string[];
      }) | undefined;
      (d?.exploitation_type ?? []).forEach((t) => types.push(t));
    });
    return countBy(types, 6);
  }, [withData]);

  const produitsPrincipauxData = useMemo(() => {
    const products: string[] = [];
    withData.forEach((a) => {
      const d = a.forestier_data as (typeof actors[0]['forestier_data'] & {
        main_products?: string[];
      }) | undefined;
      (d?.main_products ?? []).forEach((p) => products.push(p));
    });
    return countBy(products, 8);
  }, [withData]);

  const certificationData = useMemo(() => {
    const certifies = withData.filter((a) => {
      const d = a.forestier_data as (typeof actors[0]['forestier_data'] & {
        fsc_certified?: boolean;
        pefc_certified?: boolean;
      }) | undefined;
      return d?.fsc_certified === true || d?.pefc_certified === true;
    }).length;
    const nonCertifies = withData.length - certifies;
    if (withData.length === 0) return [];
    return [
      { name: 'Certifies', value: certifies },
      { name: 'Non certifies', value: nonCertifies },
    ].filter((d) => d.value > 0);
  }, [withData]);

  return (
    <>
      <ChartCard title="Types d'exploitation">
        {exploitationTypeData.length === 0 ? (
          <EmptyChart />
        ) : (
          <SimplePieChart data={exploitationTypeData} />
        )}
      </ChartCard>

      <ChartCard title="Produits principaux">
        <SimpleBarChart data={produitsPrincipauxData} color={color} />
      </ChartCard>

      <ChartCard title="Certification durable">
        <SimplePieChart data={certificationData} />
      </ChartCard>

      <ChartCard title="Exploitants par region">
        <SimpleBarChart
          data={countBy(actors.map((a) => a.region).filter(Boolean), 8)}
          color={CHART_COLORS[3]}
        />
      </ChartCard>
    </>
  );
}

// ============================================================================
// FALLBACK CHARTS (unrecognised sector)
// ============================================================================

function FallbackCharts({ actors, color }: { actors: ActorRow[]; color: string }) {
  const regionData = useMemo(() => {
    const regions = actors.map((a) => a.region).filter(Boolean);
    return countBy(regions, 8);
  }, [actors]);

  const roleData = useMemo(() => {
    const roles = actors.map((a) => a.role).filter(Boolean);
    return countBy(roles, 8);
  }, [actors]);

  const statusData = useMemo(() => {
    const statuses = actors.map((a) => a.status).filter(Boolean);
    return countBy(statuses, 6);
  }, [actors]);

  const orgTypeData = useMemo(() => {
    const types = actors
      .map((a) => a.organisation_type)
      .filter((t): t is string => Boolean(t));
    return countBy(types, 6);
  }, [actors]);

  return (
    <>
      <ChartCard title="Acteurs par region">
        <SimpleBarChart data={regionData} color={color} />
      </ChartCard>

      <ChartCard title="Roles">
        <SimpleBarChart data={roleData} color={CHART_COLORS[1]} />
      </ChartCard>

      <ChartCard title="Statuts">
        <SimplePieChart data={statusData} />
      </ChartCard>

      <ChartCard title="Types d'organisation">
        <SimplePieChart data={orgTypeData} />
      </ChartCard>
    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SectorCharts({ sector, actors, color }: SectorChartsProps) {
  if (!actors.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">
          Aucun acteur disponible pour afficher les graphiques.
        </p>
      </div>
    );
  }

  const chartContent = () => {
    switch (sector) {
      case 'vegetal':
        return <VegetalCharts actors={actors} color={color} />;
      case 'animal':
        return <AnimalCharts actors={actors} color={color} />;
      case 'halieutique':
        return <HalieutiqueCharts actors={actors} color={color} />;
      case 'forestier':
        return <ForestierCharts actors={actors} color={color} />;
      default:
        return <FallbackCharts actors={actors} color={color} />;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {chartContent()}
    </div>
  );
}
