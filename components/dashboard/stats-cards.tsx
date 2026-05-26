'use client';

import { motion } from '@/lib/motion';
import { Users, Map, BarChart3, Bell, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatNumber, getTrendColor } from '@/lib/utils';
import type { KPIStats } from '@/types/api';

interface StatsCardsProps {
  data?: KPIStats;
  isLoading?: boolean;
}

const cards = [
  {
    key: 'producers_count' as const,
    trendKey: 'producers_trend' as const,
    label: 'Producteurs',
    icon: Users,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    gradient: 'from-green-500/5 to-transparent',
    suffix: '',
  },
  {
    key: 'total_area_ha' as const,
    trendKey: 'area_trend' as const,
    label: 'Superficie',
    icon: Map,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    gradient: 'from-blue-500/5 to-transparent',
    suffix: ' ha',
  },
  {
    key: 'avg_yield_kg_ha' as const,
    trendKey: 'yield_trend' as const,
    label: 'Rendement',
    icon: BarChart3,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    gradient: 'from-amber-500/5 to-transparent',
    suffix: ' kg/ha',
  },
  {
    key: 'active_alerts' as const,
    trendKey: null,
    label: 'Alertes',
    icon: Bell,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    gradient: 'from-red-500/5 to-transparent',
    suffix: '',
  },
];

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
              <Skeleton className="h-9 w-28 mb-3" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = data?.[card.key] ?? 0;
        const trendData = card.trendKey ? (data?.[card.trendKey] ?? null) : null;
        const trend = (trendData && typeof trendData === 'object' && 'value' in trendData) ? trendData.value : null;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Card className="card-hover group cursor-default overflow-hidden relative border-border/50 bg-card/50 backdrop-blur-sm">
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-80", card.gradient)} />
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{card.label}</p>
                  <div className={cn('h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300', card.bg)}>
                    <Icon className={cn('h-6 w-6', card.color)} />
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-extrabold font-data text-foreground tracking-tight">
                    {formatNumber(value)}
                  </p>
                  <span className="text-sm font-semibold text-muted-foreground">{card.suffix}</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {trend !== null ? (
                    <div className={cn('flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-background/50 border border-border/50', getTrendColor(trend))}>
                      {trend > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : trend < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      <span>
                        {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                      </span>
                    </div>
                  ) : <div className="h-5" />}

                  {card.key === 'active_alerts' && data?.alerts_severity && (
                    <div className={cn(
                      'text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border',
                      data.alerts_severity === 'emergency' ? 'text-red-600 bg-red-50 border-red-200' :
                      data.alerts_severity === 'critical' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                      data.alerts_severity === 'warning' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-blue-600 bg-blue-50 border-blue-200'
                    )}>
                      {data.alerts_severity}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
