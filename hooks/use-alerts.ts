'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Alert, AlertFilters } from '@/types/alert';
import type { PaginatedResponse } from '@/types/api';

export function useAlerts(filters: AlertFilters = {}) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => apiClient.get<PaginatedResponse<Alert>>('/alerts', {
      params: filters as Record<string, string>,
    }),
    refetchInterval: 30_000,
  });
}

export function useAlert(id: string) {
  return useQuery({
    queryKey: ['alerts', id],
    queryFn: () => apiClient.get<Alert>(`/alerts/${id}`),
    enabled: !!id,
  });
}

export function useInfiniteAlerts(filters: AlertFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['alerts', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<PaginatedResponse<Alert>>('/alerts', {
        params: { ...filters as Record<string, string>, page: pageParam as number, limit: 20 },
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => last.has_next ? last.page + 1 : undefined,
    refetchInterval: 30_000,
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/alerts/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/alerts/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}
