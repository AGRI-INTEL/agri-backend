'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Alert, AlertFilters } from '@/types/alert';
import type { PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

// ============================================================================
// QUERIES
// ============================================================================

export function useAlerts(filters: AlertFilters = {}) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Alert> | Alert[]>('/alerts', {
        params: filters as Record<string, string | number | boolean | undefined | null>,
      }),
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return 15_000;
    },
    staleTime: 10_000,
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
        params: {
          ...(filters as Record<string, string | number | boolean | undefined | null>),
          page: pageParam as number,
          limit: 20,
        },
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      (last as PaginatedResponse<Alert>).has_next
        ? (last as PaginatedResponse<Alert>).page + 1
        : undefined,
    refetchInterval: 15_000,
  });
}

export function useAlertStats() {
  return useQuery({
    queryKey: ['alerts', 'stats'],
    queryFn: () =>
      apiClient.get<{
        total: number;
        unread: number;
        by_severity: Record<string, number>;
        by_type: Record<string, number>;
        critical_count: number;
      }>('/alerts/stats'),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/alerts/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/alerts/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Toutes les alertes marquées comme lues');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      comment,
    }: {
      id: string;
      comment?: string;
    }) => apiClient.post(`/alerts/${id}/acknowledge`, { comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alerte acquittée');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      resolution,
    }: {
      id: string;
      resolution?: string;
    }) => apiClient.post(`/alerts/${id}/resolve`, { resolution }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alerte résolue');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      type: string;
      severity: string;
      sector?: string;
      country?: string;
      city?: string;
    }) => apiClient.post<Alert>('/alerts', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alerte créée');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}
