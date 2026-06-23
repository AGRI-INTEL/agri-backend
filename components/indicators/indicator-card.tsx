'use client';

import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from 'recharts';

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

const CATEGORY_STYLES: Record<string, { label: string; color: string; border: string; bg: string }> = {
  comptes_exploitation: { label: 'Comptes', color: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  revenus: { label: 'Revenus', color: 'text-blue-600', border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  pauvrete: { label: 'Pauvreté', color: 'text-orange-600', border: 'border-orange-200 dark:border-orange-800', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  nutrition: { label: 'Nutrition', color: 'text-green-600', border: 'border-green-200 dark:border-green-800', bg: 'bg-green-50 dark:bg-green-950/20' },
  sante: { label: 'Santé', color: 'text-red-600', border: 'border-red-200 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-950/20' },
  bien_etre: { label: 'Bien-être', color: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  rendement: { label: 'Rendement', color: 'text-green-600', border: 'border-green-200 dark:border-green-800', bg: 'bg-green-50 dark:bg-green-950/20' },
  prix: { label: 'Prix', color: 'text-amber-600', border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  production: { label: 'Production', color: 'text-blue-600', border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  marche: { label: 'Marché', color: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  emploi: { label: 'Emploi', color: 'text-cyan-600', border: 'border-cyan-200 dark:border-cyan-800', bg: 'bg-cyan-50 dark:bg-cyan-950/20' },
  climat: { label: 'Climat', color: 'text-orange-600', border: 'border-orange-200 dark:border-orange-800', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  environnement: { label: 'Environnement', color: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
};

const SECTOR_LABELS: Record<string, string> = {
  vegetal: 'Végétal', animal: 'Animal', halieutique: 'Halieutique', forestier: 'Forestier',
};

const SECTOR_DOTS: Record<string, string> = {
  vegetal: 'bg-green-500', animal: 'bg-amber-500', halieutique: 'bg-cyan-500', forestier: 'bg-amber-800',
};

function SparklineChart({ data }: { data?: Array<{ date: string; value: number }> }) {
  if (!data?.length) return null;
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip contentStyle={{ fontSize: 10, padding: '4px 8px', background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 6 }} />
          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#sparkGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function HealthGauge({ status }: { status?: string }) {
  if (!status || status === 'unknown') return null;
  const config: Record<string, { icon: React.ElementType; label: string; color: string; bg: string; ring: string }> = {
    optimal: { icon: CheckCircle2, label: 'Optimal', color: 'text-green-700', bg: 'bg-green-100 dark:bg-green-900/30', ring: 'ring-green-500/30' },
    alert: { icon: Info, label: 'Surveillance', color: 'text-yellow-700', bg: 'bg-yellow-100 dark:bg-yellow-900/30', ring: 'ring-yellow-500/30' },
    critical: { icon: AlertTriangle, label: 'Critique', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/30', ring: 'ring-red-500/30' },
  };
  const c = config[status] || config.alert;
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', c.bg, c.color, c.ring)}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

export function IndicatorCard({ row, onClick }: { row: IndicatorDataRow; onClick?: () => void }) {
  const cat = CATEGORY_STYLES[row.category] || CATEGORY_STYLES.rendement;
  const TrendIcon = row.trend === 'up' ? TrendingUp : row.trend === 'down' ? TrendingDown : Minus;
  const trendColor = row.trend === 'up' ? 'text-green-600' : row.trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

  return (
    <Card
      className={cn(
        'group relative border-border/50 shadow-sm transition-all duration-200',
        'hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5',
        'cursor-pointer',
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={cn('inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-tight', cat.border, cat.color, cat.bg)}>
                {cat.label}
              </span>
              {row.sector && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className={cn('h-1.5 w-1.5 rounded-full', SECTOR_DOTS[row.sector] || 'bg-gray-400')} />
                  {SECTOR_LABELS[row.sector] || row.sector}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-snug line-clamp-1">{row.name}</h3>
          </div>
          <HealthGauge status={row.health_status} />
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight">{formatNumber(row.value)}</span>
          <span className="text-[11px] text-muted-foreground">{row.unit}</span>
        </div>

        {/* Trend + Country */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn('inline-flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {row.trend === 'up' ? 'Hausse' : row.trend === 'down' ? 'Baisse' : 'Stable'}
            {row.trend_percent != null && (
              <span className="font-mono">{row.trend_percent > 0 ? '+' : ''}{row.trend_percent}%</span>
            )}
          </span>
          {row.country && (
            <span className="text-[10px] text-muted-foreground">{row.country}</span>
          )}
        </div>

        {/* Sparkline */}
        {row.history && row.history.length > 0 && (
          <div className="-mx-1 -mb-1">
            <SparklineChart data={row.history} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/20">
          <span className="truncate max-w-[140px]">{row.source || 'Source inconnue'}</span>
          {row.year && <span className="font-mono">{row.year}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export function IndicatorCardSkeleton() {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-36 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="h-8 w-28 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-10 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

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
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow group">
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
