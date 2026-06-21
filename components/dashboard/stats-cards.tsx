'use client';

import { motion } from '@/lib/motion';
import { Users, Map, BarChart3, Bell, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
    iconColor: '#34D399',
    iconBg: 'rgba(52,211,153,0.12)',
    glow: '#34D399',
    suffix: '',
  },
  {
    key: 'total_area_ha' as const,
    trendKey: 'area_trend' as const,
    label: 'Superficie totale',
    icon: Map,
    iconColor: '#60A5FA',
    iconBg: 'rgba(96,165,250,0.12)',
    glow: '#60A5FA',
    suffix: ' ha',
  },
  {
    key: 'avg_yield_kg_ha' as const,
    trendKey: 'yield_trend' as const,
    label: 'Rendement moyen',
    icon: BarChart3,
    iconColor: '#FBBF24',
    iconBg: 'rgba(251,191,36,0.12)',
    glow: '#FBBF24',
    suffix: ' kg/ha',
  },
  {
    key: 'active_alerts' as const,
    trendKey: null,
    label: 'Alertes actives',
    icon: Bell,
    iconColor: '#F87171',
    iconBg: 'rgba(248,113,113,0.12)',
    glow: '#F87171',
    suffix: '',
  },
] as const;

function MiniSparkBar({ color }: { color: string }) {
  const bars = [4, 7, 5, 9, 6, 8, 7, 10, 8, 12];
  return (
    <div className="flex items-end gap-0.5 h-5" style={{ opacity: 0.30 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-sm"
          style={{ height: `${h * 1.6}px`, backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#152219', border: '1px solid rgba(196,146,58,0.14)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-24 rounded-full" style={{ background: 'rgba(196,146,58,0.08)' }} />
        <div className="h-10 w-10 rounded-xl" style={{ background: 'rgba(196,146,58,0.08)' }} />
      </div>
      <div className="h-9 w-24 rounded-lg mb-2" style={{ background: 'rgba(196,146,58,0.08)' }} />
      <div className="h-5 w-full rounded" style={{ background: 'rgba(196,146,58,0.08)' }} />
    </div>
  );
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = data?.[card.key] ?? 0;
        const trendData = card.trendKey ? (data?.[card.trendKey] ?? null) : null;
        const trend = (trendData && typeof trendData === 'object' && 'value' in trendData)
          ? (trendData as { value: number }).value
          : null;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <div
              className="relative overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: '#152219',
                border: '1px solid rgba(196,146,58,0.14)',
                borderTop: `3px solid ${card.glow}`,
                borderRadius: '12px',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(196,146,58,0.18)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Subtle gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at top right, ${card.glow}08 0%, transparent 60%)`,
                }}
              />

              <div className="p-5 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#7D9486' }}
                  >
                    {card.label}
                  </p>
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: card.iconBg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: card.iconColor }} />
                  </div>
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className="text-3xl font-extrabold font-data tracking-tight"
                    style={{ color: '#E8E0CC' }}
                  >
                    {formatNumber(value)}
                  </span>
                  <span className="text-sm font-medium" style={{ color: '#7D9486' }}>{card.suffix}</span>
                </div>

                {/* Sparkline */}
                <MiniSparkBar color={card.glow} />

                {/* Footer */}
                <div className="mt-2 flex items-center justify-between">
                  {trend !== null ? (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
                        getTrendColor(trend)
                      )}
                      style={{
                        background: 'rgba(12,24,16,0.60)',
                        border: '1px solid rgba(196,146,58,0.12)',
                      }}
                    >
                      {trend > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : trend < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
                    </div>
                  ) : <div className="h-5" />}

                  {card.key === 'active_alerts' && data?.alerts_severity && (
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        background: data.alerts_severity === 'emergency' ? 'rgba(239,68,68,0.12)' :
                          data.alerts_severity === 'critical' ? 'rgba(249,115,22,0.12)' :
                          data.alerts_severity === 'warning' ? 'rgba(234,179,8,0.12)' :
                          'rgba(59,130,246,0.12)',
                        color: data.alerts_severity === 'emergency' ? '#f87171' :
                          data.alerts_severity === 'critical' ? '#fb923c' :
                          data.alerts_severity === 'warning' ? '#fbbf24' :
                          '#60a5fa',
                        border: `1px solid ${
                          data.alerts_severity === 'emergency' ? 'rgba(239,68,68,0.25)' :
                          data.alerts_severity === 'critical' ? 'rgba(249,115,22,0.25)' :
                          data.alerts_severity === 'warning' ? 'rgba(234,179,8,0.25)' :
                          'rgba(59,130,246,0.25)'
                        }`,
                      }}
                    >
                      {data.alerts_severity}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
