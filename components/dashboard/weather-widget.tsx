'use client';

import Link from 'next/link';
import { Sun, Wind, Droplets, ArrowRight } from 'lucide-react';
import { useWeather } from '@/hooks/use-weather';
import { cn } from '@/lib/utils';
import type { LocalWeatherCondition } from '@/types/weather';

const conditionConfig: Record<LocalWeatherCondition, {
  gradient: string;
  textColor: string;
  emoji: string;
}> = {
  sunny: { gradient: 'from-amber-400 via-orange-400 to-yellow-500', textColor: 'text-amber-100', emoji: '☀️' },
  partly_cloudy: { gradient: 'from-blue-400 via-sky-400 to-cyan-500', textColor: 'text-sky-100', emoji: '⛅' },
  cloudy: { gradient: 'from-slate-400 via-gray-500 to-slate-600', textColor: 'text-slate-100', emoji: '☁️' },
  rainy: { gradient: 'from-blue-500 via-indigo-500 to-blue-700', textColor: 'text-blue-100', emoji: '🌧️' },
  stormy: { gradient: 'from-purple-600 via-violet-600 to-indigo-700', textColor: 'text-purple-100', emoji: '⛈️' },
  foggy: { gradient: 'from-gray-300 via-slate-400 to-gray-500', textColor: 'text-gray-100', emoji: '🌫️' },
  windy: { gradient: 'from-cyan-400 via-teal-400 to-cyan-600', textColor: 'text-cyan-100', emoji: '💨' },
  hot: { gradient: 'from-red-400 via-orange-500 to-amber-500', textColor: 'text-red-100', emoji: '🔥' },
  harmattan: { gradient: 'from-amber-500 via-yellow-500 to-orange-400', textColor: 'text-amber-100', emoji: '🏜️' },
};

export function WeatherWidget() {
  const { data: weather, isLoading } = useWeather('Dakar');

  if (isLoading) {
    return (
      <div
        className="rounded-xl overflow-hidden h-full"
        style={{ background: '#152219', border: '1px solid rgba(196,146,58,0.14)' }}
      >
        <div
          className="h-36 animate-pulse"
          style={{ background: 'rgba(96,165,250,0.12)' }}
        />
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg animate-pulse"
                style={{ background: 'rgba(196,146,58,0.08)' }}
              />
            ))}
          </div>
          <div
            className="h-8 w-full rounded-lg animate-pulse"
            style={{ background: 'rgba(196,146,58,0.08)' }}
          />
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const cfg = conditionConfig[weather.condition] ?? conditionConfig.sunny;
  const { gradient, textColor, emoji } = cfg;

  return (
    <div
      className="rounded-xl overflow-hidden h-full flex flex-col"
      style={{ background: '#152219', border: '1px solid rgba(196,146,58,0.14)' }}
    >
      {/* Hero gradient panel */}
      <div className={cn('relative bg-gradient-to-br', gradient, 'p-5 overflow-hidden')}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className={cn('text-xs font-semibold uppercase tracking-widest mb-1 opacity-80', textColor)}>
              {weather.city}, {weather.country}
            </p>
            <div className="flex items-end gap-2">
              <span className="text-6xl font-bold text-white leading-none">
                {weather.temperature}°
              </span>
              <span className={cn('text-lg font-medium mb-1 opacity-80', textColor)}>C</span>
            </div>
            <p className={cn('text-sm mt-1 capitalize opacity-90', textColor)}>
              {weather.description}
            </p>
          </div>
          <div className="text-5xl select-none" role="img" aria-label={weather.condition}>
            {emoji}
          </div>
        </div>
      </div>

      {/* Details panel */}
      <div className="p-4 flex-1 flex flex-col gap-3" style={{ background: '#152219' }}>
        <div className="grid grid-cols-3 gap-2">
          <div
            className="flex flex-col items-center rounded-xl p-2.5 text-center"
            style={{
              background: 'rgba(21,34,25,0.60)',
              border: '1px solid rgba(196,146,58,0.10)',
            }}
          >
            <Droplets className="h-4 w-4 mb-1" style={{ color: '#60A5FA' }} />
            <span className="text-sm font-bold font-data" style={{ color: '#E8E0CC' }}>{weather.humidity}%</span>
            <span className="text-[10px] leading-tight" style={{ color: '#7D9486' }}>Humidité</span>
          </div>
          <div
            className="flex flex-col items-center rounded-xl p-2.5 text-center"
            style={{
              background: 'rgba(21,34,25,0.60)',
              border: '1px solid rgba(196,146,58,0.10)',
            }}
          >
            <Wind className="h-4 w-4 mb-1" style={{ color: '#22D3EE' }} />
            <span className="text-sm font-bold font-data" style={{ color: '#E8E0CC' }}>{weather.wind_speed}</span>
            <span className="text-[10px] leading-tight" style={{ color: '#7D9486' }}>km/h</span>
          </div>
          <div
            className="flex flex-col items-center rounded-xl p-2.5 text-center"
            style={{
              background: 'rgba(21,34,25,0.60)',
              border: '1px solid rgba(196,146,58,0.10)',
            }}
          >
            <Sun className="h-4 w-4 mb-1" style={{ color: '#FBBF24' }} />
            <span className="text-sm font-bold font-data" style={{ color: '#E8E0CC' }}>UV {weather.uv_index}</span>
            <span className="text-[10px] leading-tight" style={{ color: '#7D9486' }}>Indice</span>
          </div>
        </div>

        <Link
          href="/weather"
          className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-semibold mt-auto transition-all duration-150"
          style={{
            background: 'rgba(196,146,58,0.08)',
            border: '1px solid rgba(196,146,58,0.22)',
            color: '#C4923A',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,146,58,0.14)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,146,58,0.08)'; }}
        >
          Prévisions complètes
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
