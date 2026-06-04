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
    staleTime: 15 * 60 * 1000,
  });
}

export function useWeatherHistory(city?: string, days = 7) {
  return useQuery({
    queryKey: ['weather', 'history', city, days],
    queryFn: () =>
      apiClient.get<{
        city: string;
        data: Array<{
          date: string;
          temperature_max: number;
          temperature_min: number;
          temperature_avg: number;
          precipitation_mm: number;
          humidity: number;
          wind_speed: number;
          pressure: number;
        }>;
      }>('/weather/history', { params: { city, days } }),
    enabled: !!city,
    staleTime: 30 * 60 * 1000,
  });
}

export function useWeatherAlerts(city?: string) {
  return useQuery({
    queryKey: ['weather', 'alerts', city],
    queryFn: () =>
      apiClient.get<
        Array<{
          id: string;
          type: string;
          severity: 'minor' | 'moderate' | 'severe' | 'extreme';
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          areas: string[];
        }>
      >('/weather/alerts', { params: { city } }),
    enabled: !!city,
    refetchInterval: 15 * 60 * 1000,
  });
}

export function useMultiCityWeather(cities: string[]) {
  return useQuery({
    queryKey: ['weather', 'multi', cities],
    queryFn: () =>
      apiClient.get<WeatherCurrent[]>('/weather/multi', {
        params: { cities: cities.join(',') },
      }),
    enabled: cities.length > 0,
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });
}
