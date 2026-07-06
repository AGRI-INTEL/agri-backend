'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ensureArray } from '@/lib/utils';

export interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiClient.get<unknown>('/auth/api-keys').then((r) => ensureArray<ApiKey>(r, 'api_keys')),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; scopes?: string[] }) =>
      apiClient.post<{ key: string; id: string }>('/auth/api-keys', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/auth/api-keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}
