'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Actor, ActorFilters } from '@/types/actor';
import type { PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

function actorFiltersToParams(
  filters: ActorFilters,
  defaults: { page: number; limit: number }
): Record<string, string | number | boolean | undefined | null> {
  const params: Record<string, string | number | boolean | undefined | null> = {
    page: filters.page ?? defaults.page,
    limit: filters.limit ?? defaults.limit,
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || key === 'page' || key === 'limit') continue;
    params[key] = Array.isArray(value) ? value.join(',') : (value as string | number | boolean);
  }

  return params;
}

export function useActors(filters: ActorFilters = {}) {
  return useQuery({
    queryKey: ['actors', filters],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Actor>>('/actors', {
        params: actorFiltersToParams(filters, { page: 1, limit: 25 }),
      }),
  });
}

export function useActor(id: string) {
  return useQuery({
    queryKey: ['actors', id],
    queryFn: () => apiClient.get<Actor>(`/actors/${id}`),
    enabled: !!id,
  });
}

export function useInfiniteActors(filters: Omit<ActorFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['actors', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<PaginatedResponse<Actor>>('/actors', {
        params: actorFiltersToParams(filters, { page: pageParam as number, limit: 20 }),
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => last.has_next ? last.page + 1 : undefined,
  });
}

export function useCreateActor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Actor>) => apiClient.post<Actor>('/actors', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['actors'] });
      toast.success('Acteur créé avec succès');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useUpdateActor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Actor>) => apiClient.patch<Actor>(`/actors/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['actors'] });
      toast.success('Acteur mis à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDeleteActor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/actors/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['actors'] });
      toast.success('Acteur supprimé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}
