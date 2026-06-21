'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { SECTOR_COLORS } from '@/lib/utils';
import type { ProductionDataPoint } from '@/types/api';

interface ProductionChartProps {
  data?: ProductionDataPoint[];
  isLoading?: boolean;
}

const PERIODS = [
  { label: '7j', value: '7d' },
  { label: '30j', value: '30d' },
  { label: '1an', value: '1y' },
] as const;

const SECTORS = [
  { key: 'vegetal', label: 'Végétal', color: SECTOR_COLORS.vegetal },
  { key: 'animal', label: 'Animal', color: SECTOR_COLORS.animal },
  { key: 'halieutique', label: 'Halieutique', color: SECTOR_COLORS.halieutique },
  { key: 'forestier', label: 'Forestier', color: SECTOR_COLORS.forestier },
] as const;

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl shadow-xl p-3 min-w-[160px]"
      style={{
        background: '#152219',
        border: '1px solid rgba(196,146,58,0.22)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      }}
    >
      <p className="text-xs font-semibold mb-2" style={{ color: '#7D9486' }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
            <span style={{ color: '#7D9486' }}>{p.name}</span>
          </div>
          <span className="font-bold font-data" style={{ color: '#E8E0CC' }}>{p.value.toLocaleString('fr-FR')}</span>
        </div>
      ))}
    </div>
  );
}

export function ProductionChart({ data, isLoading }: ProductionChartProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '1y'>('30d');

  if (isLoading) {
    return (
      <div
        className="h-full rounded-xl p-5"
        style={{ background: '#152219', border: '1px solid rgba(196,146,58,0.14)' }}
      >
        <div className="h-5 w-48 rounded-full mb-4 animate-pulse" style={{ background: 'rgba(196,146,58,0.10)' }} />
        <div className="h-64 w-full rounded-xl animate-pulse" style={{ background: 'rgba(196,146,58,0.06)' }} />
      </div>
    );
  }

  return (
    <div
      className="h-full rounded-xl"
      style={{
        background: '#152219',
        border: '1px solid rgba(196,146,58,0.14)',
        borderRadius: '12px',
      }}
    >
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(196,146,58,0.10)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(196,146,58,0.12)' }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: '#C4923A' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#E8E0CC' }}>Production par Secteur</p>
            <p className="text-xs" style={{ color: '#7D9486' }}>Évolution temporelle (tonnes)</p>
          </div>
        </div>
        <div
          className="flex items-center gap-0.5 p-1 rounded-lg"
          style={{
            background: 'rgba(12,24,16,0.6)',
            border: '1px solid rgba(196,146,58,0.10)',
          }}
        >
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className="h-7 px-3 text-xs rounded-md font-medium transition-all duration-150"
              style={{
                background: period === p.value ? '#C4923A' : 'transparent',
                color: period === p.value ? '#1A1000' : '#7D9486',
                fontWeight: period === p.value ? 700 : 500,
              }}
              onClick={() => setPeriod(p.value)}
              onMouseEnter={e => {
                if (period !== p.value) {
                  (e.currentTarget as HTMLElement).style.color = '#E8E0CC';
                }
              }}
              onMouseLeave={e => {
                if (period !== p.value) {
                  (e.currentTarget as HTMLElement).style.color = '#7D9486';
                }
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 pb-5">
        {/* Custom legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {SECTORS.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
              <span className="text-xs" style={{ color: '#7D9486' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={data || []} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
            <defs>
              {SECTORS.map((s) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,146,58,0.10)" strokeOpacity={1} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#7D9486' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#7D9486' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {SECTORS.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.5}
                fill={`url(#grad-${s.key})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#0C1810', fill: s.color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
