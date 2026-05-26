'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { WeatherCurrent, WeatherForecast } from '@/types/weather';

export function useWeather(city?: string, lat?: number, lng?: number) {
  return useQuery({
    queryKey: ['weather', 'current', city || `${lat},${lng}`],
    queryFn: () =>
      apiClient.get<WeatherCurrent>('/weather/current', {
        params: { city, lat, lng },
      }),
    enabled: !!(city || (lat && lng)),
    refetchInterval: 10 * 60 * 1000, // 10 min
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeatherForecast(city?: string, days = 7) {
  return useQuery({
    queryKey: ['weather', 'forecast', city, days],
    queryFn: () =>
      apiClient.get<WeatherForecast>('/weather/forecast', {
        params: { city, days },
      }),
    enabled: !!city,
    staleTime: 30 * 60 * 1000,
  });
}
