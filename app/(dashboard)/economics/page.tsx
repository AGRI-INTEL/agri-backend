'use client';

import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Percent, Globe, RefreshCw, Banknote } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useEconomicsSummary, useEconomicsGDP, useEconomicsIndicators } from '@/hooks/use-economics';
import { formatNumber } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function OverviewCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string; trend?: { dir: 'up' | 'down'; val: string };
}) {
  return (
    <Card className="border-border/40 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">{label}</p>
            <p className="mt-1 text-2xl font-bold font-mono leading-tight truncate">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground truncate">{sub}</p>}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              trend.dir === 'up'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
            }`}>
              {trend.dir === 'up' ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {trend.val}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EconomicsPage() {
  const [countryFilter, setCountryFilter] = useState('all');
  const { data: summary, isLoading: summaryLoading } = useEconomicsSummary();
  const { data: gdpData, isLoading: gdpLoading } = useEconomicsGDP(countryFilter !== 'all' ? { country: countryFilter } : undefined);
  const { data: indicators, isLoading: indicatorsLoading, refetch, isFetching } = useEconomicsIndicators(
    countryFilter !== 'all' ? { country: countryFilter } : undefined,
  );

  const s = summary as Record<string, unknown> | undefined;

  const countries = useMemo(() => {
    if (!indicators?.length) return [];
    const set = new Set<string>();
    (indicators as Record<string, unknown>[]).forEach((i) => {
      const c = i.country_name as string || i.country as string;
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [indicators]);

  const gdpChartData = useMemo(() => {
    if (!gdpData?.length) return [];
    return (gdpData as Record<string, unknown>[]).map((d) => ({
      country: (d.country_name as string) || (d.country as string) || 'N/A',
      value: Number(d.value ?? 0),
      year: d.year as string | number,
    }));
  }, [gdpData]);

  const indicatorRows = useMemo(() => {
    if (!indicators?.length) return [];
    return (indicators as Record<string, unknown>[]).slice(0, 50);
  }, [indicators]);

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold">Économie Agricole</span>
            <p className="text-xs text-muted-foreground mt-0.5">PIB agricole, croissance, inflation et indicateurs économiques</p>
          </div>
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Tous les pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pays</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-xs">Actualiser</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Overview cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <OverviewCard
              icon={DollarSign} label="PIB Agricole" color="#10B981"
              value={s?.total_gdp ? `${formatNumber(Number(s.total_gdp))} Mrd` : '—'}
              sub={s?.gdp_currency as string}
              trend={s?.gdp_growth ? { dir: Number(s.gdp_growth) >= 0 ? 'up' : 'down', val: `${s.gdp_growth}%` } : undefined}
            />
            <OverviewCard
              icon={TrendingUp} label="Taux de croissance" color="#3B82F6"
              value={s?.growth_rate ? `${s.growth_rate}%` : '—'}
              sub={s?.growth_year as string}
            />
            <OverviewCard
              icon={Percent} label="Inflation" color="#F59E0B"
              value={s?.inflation ? `${s.inflation}%` : '—'}
              sub={s?.inflation_period as string}
              trend={s?.inflation_trend ? { dir: String(s.inflation_trend) === 'down' ? 'down' : 'up', val: String(s.inflation_trend ?? '') } : undefined}
            />
            <OverviewCard
              icon={Banknote} label="Exportations" color="#8B5CF6"
              value={s?.exports ? `${formatNumber(Number(s.exports))} Mrd` : '—'}
              sub={s?.exports_currency as string}
              trend={s?.exports_growth ? { dir: Number(s.exports_growth) >= 0 ? 'up' : 'down', val: `${s.exports_growth}%` } : undefined}
            />
          </div>
        )}

        {/* GDP by country — bar chart */}
        {gdpLoading ? (
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>
        ) : gdpChartData.length > 0 ? (
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                PIB Agricole par pays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gdpChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                      dataKey="country"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Economic indicators table */}
        {indicatorsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full rounded-lg" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : indicatorRows.length > 0 ? (
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-violet-500" />
                Indicateurs économiques
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Indicateur</th>
                      <th className="text-left px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Pays</th>
                      <th className="text-right px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Valeur</th>
                      <th className="text-left px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Unité</th>
                      <th className="text-right px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Année</th>
                      <th className="text-left px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {indicatorRows.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {(row.indicator_name as string) || (row.indicator as string) || '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {(row.country_name as string) || (row.country as string) || '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          {row.value != null ? formatNumber(Number(row.value)) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {(row.unit as string) || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-mono text-muted-foreground">
                          {(row.year as string | number)?.toString() ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {(row.source as string) || (row.data_source as string) || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          !summaryLoading && (
            <EmptyState
              icon="📊"
              title="Aucune donnée économique"
              description="Les indicateurs économiques ne sont pas encore disponibles pour les filtres sélectionnés."
            />
          )
        )}
      </div>
    </PageWrapper>
  );
}
