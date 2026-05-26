'use client';

import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeatherForecast } from '@/hooks/use-weather';
import { cn } from '@/lib/utils';
import type { LocalWeatherCondition, WeatherForecastDayEnriched } from '@/types/weather';

const icons: Record<LocalWeatherCondition, React.ElementType> = {
  sunny: Sun, partly_cloudy: Cloud, cloudy: Cloud, rainy: CloudRain,
  stormy: CloudRain, foggy: Cloud, windy: Wind, hot: Sun, harmattan: Wind,
};

interface WeatherForecastPanelProps {
  city: string;
  days?: number;
}

export function WeatherForecastPanel({ city, days = 7 }: WeatherForecastPanelProps) {
  const { data, isLoading } = useWeatherForecast(city, days);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </CardContent>
      </Card>
    );
  }

  if (!data?.forecast?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Prévisions — {data.city || 'Météo'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {data.forecast.map((day: WeatherForecastDayEnriched) => {
            const Icon = icons[day.condition as LocalWeatherCondition] || Cloud;
            const date = new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
            return (
              <div key={day.date} className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground capitalize mb-2">{date}</p>
                <Icon className={cn('h-8 w-8 mx-auto mb-2', day.condition === 'rainy' ? 'text-blue-500' : 'text-yellow-500')} />
                <p className="text-sm font-data font-semibold">{day.temperature_max}° / {day.temperature_min}°</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Droplets className="h-3 w-3" />
                  {day.precipitation_probability}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
