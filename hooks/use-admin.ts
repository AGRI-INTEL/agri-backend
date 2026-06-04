'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { mapBackendUser } from '@/lib/user-mapper';
import type { User, UserRole, Permission } from '@/types/auth';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminUsersResponse {
  users: Record<string, unknown>[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface AdminStatsResponse {
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

export interface AdminActivityLog {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address?: string;
  timestamp: string;
}

// ============================================================================
// QUERIES
// ============================================================================

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.get<AdminStatsResponse>('/admin/stats'),
    staleTime: 60_000,
  });
}

export function useAdminUsers(params: {
  page?: number;
  search?: string;
  role?: string;
  status?: string;
  per_page?: number;
} = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const res = await apiClient.get<AdminUsersResponse>('/admin/users', {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          search: params.search || undefined,
          role: params.role || undefined,
          status: params.status || undefined,
        },
      });
      return {
        ...res,
        users: res.users.map((u) => mapBackendUser(u)),
      };
    },
    staleTime: 30_000,
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const raw = await apiClient.get<Record<string, unknown>>(`/admin/users/${userId}`);
      return mapBackendUser(raw);
    },
    enabled: !!userId,
  });
}

export function useAdminActivityLogs(params: { page?: number; user_id?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'activity', params],
    queryFn: () =>
      apiClient.get<{ logs: AdminActivityLog[]; total: number }>('/admin/activity', {
        params: { page: params.page || 1, per_page: 20, user_id: params.user_id },
      }),
    staleTime: 30_000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useAdminUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        role?: UserRole;
        is_active?: boolean;
        is_verified?: boolean;
        status?: string;
        notes?: string;
      };
    }) => apiClient.put<Record<string, unknown>>(`/admin/users/${userId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
    onSuccess: (_, { activate }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success(activate ? 'Utilisateur activé' : 'Utilisateur désactivé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Utilisateur supprimé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useAdminResetUserPassword() {
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.post(`/admin/users/${userId}/reset-password`),
    onSuccess: () => toast.success('Email de réinitialisation envoyé'),
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useAdminUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      apiClient.put(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Rôle mis à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useAdminUpdateUserPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      permissions,
    }: {
      userId: string;
      permissions: Permission[];
    }) => apiClient.put(`/admin/users/${userId}/permissions`, { permissions }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Permissions mises à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useAdminExportUsers() {
  return useMutation({
    mutationFn: (params: {
      format: 'csv' | 'excel' | 'pdf';
      role?: string;
      status?: string;
      search?: string;
    }) =>
      apiClient.post<{ job_id: string; download_url?: string }>(
        '/admin/users/export',
        params
      ),
    onSuccess: (data) => {
      if (data?.download_url) {
        window.open(data.download_url, '_blank');
      } else {
        toast.success("Export lancé, vous recevrez le fichier par email");
      }
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}
