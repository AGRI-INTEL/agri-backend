'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import type { EconomicIndicatorRow } from '@/hooks/use-indicators';

const INDICATOR_LABELS: Record<string, string> = {
  gdp: 'PIB',
  inflation: 'Inflation',
  agricultural_gdp: 'PIB agricole',
  employment: 'Emploi agricole',
  export: 'Exportations',
  import: 'Importations',
  investment: 'Investissements',
};

interface IndicatorCardProps {
  row: EconomicIndicatorRow;
}

export function IndicatorCard({ row }: IndicatorCardProps) {
  const label = INDICATOR_LABELS[row.indicator] || row.indicator;

  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-xs text-muted-foreground">{row.country_name}</p>
            <h3 className="font-semibold text-sm">{label}</h3>
          </div>
          <Badge variant="outline" className="text-xs">{row.year}</Badge>
        </div>
        <p className="text-2xl font-bold font-data">
          {formatNumber(row.value)}
          <span className="text-sm font-normal text-muted-foreground ml-1">{row.unit}</span>
        </p>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Source: {row.source}</span>
          {row.is_estimated && <Badge variant="warning">Estimé</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

/** Carte indicateur métier (seuil) */
export function BusinessIndicatorCard({
  name,
  value,
  unit,
  trend,
  trendPercent,
  category,
}: {
  name: string;
  value?: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
  category?: string;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        {category && <p className="text-xs text-muted-foreground mb-1 capitalize">{category.replace(/_/g, ' ')}</p>}
        <h3 className="font-semibold text-sm mb-2">{name}</h3>
        <p className="text-2xl font-bold font-data">
          {value != null ? formatNumber(value) : '—'}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trendColor}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendPercent != null && <span>{trendPercent > 0 ? '+' : ''}{trendPercent}%</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
