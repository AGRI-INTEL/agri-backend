'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Indicator, IndicatorHistory } from '@/types/indicator';
import type { Sector } from '@/types/actor';

export interface EconomicIndicatorRow {
  country_code: string;
  country_name: string;
  indicator: string;
  year: number;
  value: number;
  unit: string;
  source: string;
  is_estimated?: boolean;
  notes?: string;
}

export function useEconomicIndicators(country?: string, indicator?: string) {
  return useQuery({
    queryKey: ['economic-indicators', country, indicator],
    queryFn: async () => {
      const res = await apiClient.get<{ data: EconomicIndicatorRow[]; count: number }>(
        '/economics/indicators',
        { params: { country, indicator, limit: 100 } }
      );
      return res.data || [];
    },
  });
}

export function useIndicators(sector?: Sector, category?: string) {
  return useQuery({
    queryKey: ['indicators', sector, category],
    queryFn: () =>
      apiClient.get<Indicator[]>('/indicators', {
        params: { sector, category } as Record<string, string>,
      }),
    retry: false,
  });
}

export function useIndicator(id: string) {
  return useQuery({
    queryKey: ['indicators', id],
    queryFn: () => apiClient.get<Indicator>(`/indicators/${id}`),
    enabled: !!id,
  });
}

export function useIndicatorHistory(id: string, period: 'monthly' | 'quarterly' | 'annual' = 'monthly') {
  return useQuery({
    queryKey: ['indicators', id, 'history', period],
    queryFn: () => apiClient.get<IndicatorHistory[]>(`/indicators/${id}/history`, {
      params: { period },
    }),
    enabled: !!id,
  });
}

export function useUpdateIndicatorThresholds(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (thresholds: { critical: number; alert: number; optimal: number }) =>
      apiClient.patch(`/indicators/${id}/thresholds`, thresholds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['indicators', id] }),
  });
}

export function useCreateIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post<{ id: string; message: string }>('/indicators', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['indicators'] });
    },
  });
}

export function useDeleteIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<{ message: string }>(`/indicators/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['indicators'] });
    },
  });
}

export function useFetchExternalIndicators() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.get<{ success: boolean; count: number; saved: number; errors: string[] }>('/indicators/external-fetch'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['indicators'] });
    },
  });
}

export function useSeedDemoIndicators() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post<{ message: string; count: number }>('/indicators/seed'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['indicators'] });
    },
  });
}
