'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { IndicatorFiltersBar } from '@/components/indicators/indicator-filters';
import { IndicatorCard } from '@/components/indicators/indicator-card';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useEconomicIndicators } from '@/hooks/use-indicators';

export default function IndicatorsPage() {
  const [search, setSearch] = useState('');
  const [indicator, setIndicator] = useState('all');
  const [country, setCountry] = useState('all');

  const { data, isLoading } = useEconomicIndicators(
    country === 'all' ? undefined : country,
    indicator === 'all' ? undefined : indicator
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (r) =>
        r.country_name.toLowerCase().includes(q) ||
        r.indicator.toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <PageWrapper
      title="Indicateurs économiques"
      description="PIB agricole, inflation, emploi et commerce par pays"
    >
      <IndicatorFiltersBar
        search={search}
        onSearchChange={setSearch}
        indicator={indicator}
        onIndicatorChange={setIndicator}
        country={country}
        onCountryChange={setCountry}
      />

      <div className="mt-6">
        {isLoading ? (
          <LoadingSkeleton variant="card" count={8} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="📊" title="Aucun indicateur" description="Modifiez les filtres ou réessayez plus tard." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((row, i) => (
              <IndicatorCard key={`${row.country_code}-${row.indicator}-${row.year}-${i}`} row={row} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
