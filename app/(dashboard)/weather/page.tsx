'use client';

import { useState } from 'react';
import { CloudSun } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherForecastPanel } from '@/components/weather/weather-forecast-panel';
import { useWeather } from '@/hooks/use-weather';
import { cn } from '@/lib/utils';
import type { LocalWeatherCondition } from '@/types/weather';
import { Sun, Cloud, CloudRain, Wind } from 'lucide-react';

const CITIES = ['Dakar', 'Abidjan', 'Accra', 'Lomé', 'Bamako', 'Niamey', 'Lagos'];

const icons: Record<LocalWeatherCondition, React.ElementType> = {
  sunny: Sun, partly_cloudy: Cloud, cloudy: Cloud, rainy: CloudRain,
  stormy: CloudRain, foggy: Cloud, windy: Wind, hot: Sun, harmattan: Wind,
};

export default function WeatherPage() {
  const [city, setCity] = useState('Dakar');
  const { data: weather, isLoading } = useWeather(city);

  const getIcon = () => {
    if (!weather?.condition) return CloudSun;
    const condition = weather.condition as LocalWeatherCondition;
    return icons[condition] || Sun;
  };

  const Icon = getIcon();

  return (
    <PageWrapper title="Météo" description="Conditions actuelles et prévisions sur 7 jours">
      <div className="mb-4 w-48">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-card" />
      ) : weather ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon className={cn('h-10 w-10', weather.condition === 'rainy' ? 'text-blue-500' : 'text-yellow-500')} />
              {weather.city}, {weather.country}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold font-data">{weather.temperature}°C</p>
            <p className="text-muted-foreground capitalize mt-1">{weather.description}</p>
            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
              <div><p className="font-data font-semibold">{weather.humidity}%</p><p className="text-xs text-muted-foreground">Humidité</p></div>
              <div><p className="font-data font-semibold">{weather.wind_speed} km/h</p><p className="text-xs text-muted-foreground">Vent</p></div>
              <div><p className="font-data font-semibold">UV {weather.uv_index}</p><p className="text-xs text-muted-foreground">Indice UV</p></div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <WeatherForecastPanel city={city} />
    </PageWrapper>
  );
}
