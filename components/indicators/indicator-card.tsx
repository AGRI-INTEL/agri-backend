'use client';

import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatNumber } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IndicatorDataRow {
  id: string;
  name: string;
  description?: string;
  category: string;
  sector: string;
  unit: string;
  value: number;
  previous_value?: number;
  trend: 'up' | 'down' | 'stable';
  trend_percent?: number;
  year?: number;
  country?: string;
  source?: string;
  health_status?: 'optimal' | 'alert' | 'critical';
  higher_is_better?: boolean;
  history?: Array<{ date: string; value: number }>;
  last_updated?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  rendement: 'text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200',
  prix: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200',
  production: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200',
  marché: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-200',
  emploi: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200',
  climat: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-200',
  environnement: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200',
};

const CATEGORY_LABELS: Record<string, string> = {
  rendement: 'Rendement', prix: 'Prix', production: 'Production',
  marché: 'Marché', emploi: 'Emploi', climat: 'Climat',
  environnement: 'Environnement',
};

const SECTOR_LABELS: Record<string, string> = {
  vegetal: 'Végétal', animal: 'Animal', halieutique: 'Halieutique',
  forestier: 'Forestier',
};

function SparklineChart({ data }: { data?: Array<{ date: string; value: number }> }) {
  if (!data?.length) return null;
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip contentStyle={{ fontSize: 10, padding: '4px 8px' }} />
          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#sparkGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendBadge({ trend, percent }: { trend: string; percent?: number }) {
  const config: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    up: { icon: TrendingUp, label: 'Hausse', color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20' },
    down: { icon: TrendingDown, label: 'Baisse', color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20' },
    stable: { icon: Minus, label: 'Stable', color: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800/20' },
  };
  const c = config[trend] || config.stable;
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium', c.color)}>
      <Icon className="h-3 w-3" />
      {c.label}{percent != null ? ` (${percent > 0 ? '+' : ''}${percent}%)` : ''}
    </span>
  );
}

function HealthBadge({ status }: { status?: string }) {
  if (!status || status === 'unknown') return null;
  const config: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    optimal: { icon: CheckCircle2, label: 'Optimal', color: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300' },
    alert: { icon: Info, label: 'Surveillance', color: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300' },
    critical: { icon: AlertTriangle, label: 'Critique', color: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300' },
  };
  const c = config[status] || config.alert;
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', c.color)}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

// ─── Indicator Card ──────────────────────────────────────────────────────────

export function IndicatorCard({ row }: { row: IndicatorDataRow }) {
  return (
    <Card className="border-border/50 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', CATEGORY_COLORS[row.category] || '')}>
                {CATEGORY_LABELS[row.category] || row.category}
              </Badge>
              {row.sector && (
                <span className="text-[10px] text-muted-foreground">{SECTOR_LABELS[row.sector] || row.sector}</span>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-tight truncate">{row.name}</h3>
          </div>
          <HealthBadge status={row.health_status} />
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono">{formatNumber(row.value)}</span>
          <span className="text-xs text-muted-foreground">{row.unit}</span>
        </div>

        {/* Trend + Country */}
        <div className="flex items-center justify-between gap-2">
          <TrendBadge trend={row.trend} percent={row.trend_percent} />
          {row.country && <span className="text-[10px] text-muted-foreground">{row.country}</span>}
        </div>

        {/* Sparkline */}
        {row.history && row.history.length > 0 && (
          <div className="-mx-1">
            <SparklineChart data={row.history} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
          {row.source && <span>{row.source}</span>}
          {row.year && <span>{row.year}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Business Indicator Card ─────────────────────────────────────────────────

export function BusinessIndicatorCard({
  name, value, unit, trend, trendPercent, category, sub,
}: {
  name: string;
  value?: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
  category?: string;
  sub?: string;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

  return (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {category && (
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{category}</p>
        )}
        <h3 className="font-semibold text-sm mb-1">{name}</h3>
        {sub && <p className="text-xs text-muted-foreground mb-2">{sub}</p>}
        <p className="text-2xl font-bold font-mono">
          {value != null ? formatNumber(value) : '—'}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </p>
        {trend && (
          <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendPercent != null && <span>{trendPercent > 0 ? '+' : ''}{trendPercent}%</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
