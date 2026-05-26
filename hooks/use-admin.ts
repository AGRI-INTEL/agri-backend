'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { mapBackendUser } from '@/lib/user-mapper';
import type { User, UserRole } from '@/types/auth';
import { toast } from 'sonner';

interface AdminUsersResponse {
  users: Record<string, unknown>[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

interface AdminStatsResponse {
  users: {
    total: number;
    active: number;
    verified: number;
    by_role: Record<string, number>;
    recent: Record<string, unknown>[];
  };
  system: {
    version: string;
    environment: string;
    timestamp: string;
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.get<AdminStatsResponse>('/admin/stats'),
  });
}

export function useAdminUsers(params: { page?: number; search?: string; role?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const res = await apiClient.get<AdminUsersResponse>('/admin/users', {
        params: {
          page: params.page || 1,
          per_page: 20,
          search: params.search,
          role: params.role,
        },
      });
      return {
        ...res,
        users: res.users.map((u) => mapBackendUser(u)),
      };
    },
  });
}

export function useAdminUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { role?: UserRole; is_active?: boolean; is_verified?: boolean };
    }) => apiClient.put<User>(`/admin/users/${userId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Utilisateur mis à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useAdminToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, activate }: { userId: string; activate: boolean }) =>
      apiClient.post(`/admin/users/${userId}/${activate ? 'activate' : 'deactivate'}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}
