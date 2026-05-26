'use client';

import Link from 'next/link';
import { Cloud, Sun, CloudRain, Wind, Droplets, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useWeather } from '@/hooks/use-weather';
import { cn } from '@/lib/utils';
import type { LocalWeatherCondition } from '@/types/weather';

const conditionIcons: Record<LocalWeatherCondition, React.ElementType> = {
  sunny: Sun,
  partly_cloudy: Cloud,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudRain,
  foggy: Cloud,
  windy: Wind,
  hot: Sun,
  harmattan: Wind,
};

const conditionColors: Record<LocalWeatherCondition, string> = {
  sunny: 'text-yellow-500',
  partly_cloudy: 'text-blue-400',
  cloudy: 'text-slate-400',
  rainy: 'text-blue-500',
  stormy: 'text-purple-500',
  foggy: 'text-slate-300',
  windy: 'text-cyan-400',
  hot: 'text-orange-500',
  harmattan: 'text-amber-400',
};

export function WeatherWidget() {
  const { data: weather, isLoading } = useWeather('Dakar');

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const Icon = conditionIcons[weather.condition] || Sun;
  const iconColor = conditionColors[weather.condition] || 'text-yellow-500';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Météo — {weather.city}</span>
          <span className="text-xs text-muted-foreground font-normal">{weather.country}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current */}
        <div className="flex items-center gap-4">
          <Icon className={cn('h-12 w-12', iconColor)} />
          <div>
            <p className="text-3xl font-bold font-data">{weather.temperature}°C</p>
            <p className="text-sm text-muted-foreground capitalize">{weather.description}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
            <p className="text-xs font-data font-semibold">{weather.humidity}%</p>
            <p className="text-xs text-muted-foreground">Humidité</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <Wind className="h-4 w-4 text-cyan-500 mx-auto mb-1" />
            <p className="text-xs font-data font-semibold">{weather.wind_speed} km/h</p>
            <p className="text-xs text-muted-foreground">Vent</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <Sun className="h-4 w-4 text-orange-500 mx-auto mb-1" />
            <p className="text-xs font-data font-semibold">UV {weather.uv_index}</p>
            <p className="text-xs text-muted-foreground">Indice UV</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link href="/weather">
            Voir les prévisions complètes
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
