'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ProductionChart } from '@/components/dashboard/production-chart';
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { AlertsTicker } from '@/components/dashboard/alerts-ticker';
import { InteractiveMap } from '@/components/map/interactive-map';
import type { KPIStats, ProductionDataPoint } from '@/types/api';

export function DashboardOverview() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => apiClient.get<KPIStats>('/dashboard/kpis'),
    refetchInterval: 60_000,
  });

  const { data: production, isLoading: productionLoading } = useQuery({
    queryKey: ['dashboard', 'production'],
    queryFn: () => apiClient.get<ProductionDataPoint[]>('/dashboard/production'),
  });

  return (
    <PageWrapper title="Dashboard" description="Vue d'ensemble de votre activité agricole">
      {/* KPI Cards */}
      <StatsCards data={kpis} isLoading={kpisLoading} />

      {/* Main row: chart + weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <ProductionChart data={production} isLoading={productionLoading} />
        </div>
        <div>
          <WeatherWidget />
        </div>
      </div>

      {/* Secondary row: alerts + map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <AlertsTicker />
        <div className="rounded-card border border-border bg-card overflow-hidden min-h-[280px] h-[280px]">
          <InteractiveMap className="h-full min-h-[280px]" />
        </div>
      </div>
    </PageWrapper>
  );
}
