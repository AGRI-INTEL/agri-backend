'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export interface ActorOverview {
  total_actors: number;
  active_actors: number;
  verified_actors: number;
  featured_actors: number;
  by_sector: { sector: string; count: number; color: string }[];
  by_role: { role: string; count: number }[];
  by_country: { country: string; count: number }[];
  by_status: { status: string; count: number; color: string }[];
}

export interface ActorListResponse {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export function useActorsOverview() {
  return useQuery({
    queryKey: ['actors', 'overview'],
    queryFn: () => apiClient.get<ActorOverview>('/actors/overview'),
  });
}

export function useActors(filters: Record<string, string | number | boolean | undefined | null> = {}) {
  const params: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') params[k] = v;
  }
  return useQuery({
    queryKey: ['actors', 'list', filters],
    queryFn: () => apiClient.get<ActorListResponse>('/actors/', { params }),
  });
}

export function useActor(id: string) {
  return useQuery({
    queryKey: ['actors', id],
    queryFn: () => apiClient.get<Record<string, unknown>>(`/actors/${id}`),
    enabled: !!id,
  });
}

export function useCreateActor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.post<Record<string, unknown>>('/actors/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['actors'] });
      toast.success('Acteur créé avec succès');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export async function uploadActorImage(file: File, qc: ReturnType<typeof useQueryClient>) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    await apiClient.upload('/actors/upload-image', formData);
    toast.success('Image envoyée pour analyse');
    qc.invalidateQueries({ queryKey: ['actors'] });
  } catch {
    toast.error('Ce modèle ne supporte pas les images. Utilisez l\'assistant IA.', { duration: 6000 });
  }
}

export function useUpdateActor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient.put<Record<string, unknown>>(`/actors/${id}`, data),
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
    mutationFn: (id: string) => apiClient.delete<{ message: string; id: string }>(`/actors/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['actors'] });
      toast.success('Acteur supprimé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useActorsBySector(sector: string) {
  return useQuery({
    queryKey: ['actors', 'sector-stats', sector],
    queryFn: () => apiClient.get<ActorListResponse>('/actors/', {
      params: { sector, per_page: 100 }
    }),
    enabled: !!sector,
  });
}
