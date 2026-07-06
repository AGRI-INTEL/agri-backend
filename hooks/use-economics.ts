'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ensureArray } from '@/lib/utils';

export function useEconomicsIndicators(filters?: { country?: string; indicator_type?: string; year?: string }) {
  return useQuery({
    queryKey: ['economics', 'indicators', filters],
    queryFn: () =>
      apiClient.get<unknown>('/economics/indicators', {
        params: filters as Record<string, string>,
      }).then((r) => ensureArray<Record<string, unknown>>(r, 'indicators')),
  });
}

export function useEconomicsSummary() {
  return useQuery({
    queryKey: ['economics', 'summary'],
    queryFn: () =>
      apiClient.get<Record<string, unknown>>('/economics/summary'),
  });
}

export function useEconomicsGDP(filters?: { country?: string; year_start?: string; year_end?: string }) {
  return useQuery({
    queryKey: ['economics', 'gdp', filters],
    queryFn: () =>
      apiClient.get<unknown>('/economics/gdp', {
        params: filters as Record<string, string>,
      }).then((r) => ensureArray<Record<string, unknown>>(r, 'gdp')),
  });
}
